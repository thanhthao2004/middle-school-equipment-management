// Borrow Service
const borrowRepo = require('../repositories/borrow.repo');
const { publishMessage } = require('../../../config/rabbitmq');
const cache = require('../../../core/utils/cache');

class BorrowService {
    // Lấy danh sách thiết bị với bộ lọc - Tối ưu với caching
    async getDevices(filters = {}) {
        try {
            // Tạo cache key từ filters
            const cacheKey = `devices:${JSON.stringify(filters)}`;

            // Kiểm tra cache trước
            const cached = cache.get(cacheKey);
            if (cached) {
                return cached;
            }

            const devices = await borrowRepo.getDevices(filters);
            const { BorrowDetail } = require('../models/borrow-ticket.model');

            // Map MongoDB format sang format mà frontend mong đợi
            const mappedDevices = await Promise.all(devices.map(async (device) => {
                // Sử dụng soLuongSanSang từ repository (đã được tính từ DeviceUnit với điều kiện tinhTrang: Tốt/Khá và trangThai: san_sang)
                // Điều này đảm bảo chỉ đếm thiết bị sẵn sàng cho mượn (không hỏng)
                let soLuongConLai = device.soLuongSanSang || 0;

                // Nếu là mockup device, dùng soLuong gốc
                if (device._id && device._id.toString().startsWith('mock')) {
                    soLuongConLai = device.soLuong || 0;
                }

                // Map category name
                let categoryName = '';
                if (device.category) {
                    if (typeof device.category === 'object' && device.category.tenDM) {
                        categoryName = device.category.tenDM;
                    } else if (typeof device.category === 'string') {
                        categoryName = device.category;
                    }
                } else if (device.maDM) {
                    categoryName = device.maDM;
                }

                // Map condition to frontend format
                let condition = 'good';
                if (device.tinhTrangThietBi) {
                    condition = device.tinhTrangThietBi === 'Tốt' ? 'good' : 'damaged';
                }

                // Map category name to frontend format
                const categoryMap = {
                    'hóa học': 'chemistry',
                    'hoa hoc': 'chemistry',
                    'tin học': 'it',
                    'tin hoc': 'it',
                    'vật lý': 'physics',
                    'vat ly': 'physics',
                    'ngữ văn': 'literature',
                    'ngu van': 'literature'
                };
                const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '');
                const mappedCategory = categoryMap[categoryKey] || 'chemistry';

                // Xử lý hình ảnh: đảm bảo là mảng và đường dẫn đúng
                let images = [];
                if (device.hinhAnh) {
                    if (Array.isArray(device.hinhAnh)) {
                        images = device.hinhAnh.filter(img => img && typeof img === 'string' && img.trim());
                    } else if (typeof device.hinhAnh === 'string' && device.hinhAnh.trim()) {
                        images = [device.hinhAnh.trim()];
                    }
                }

                return {
                    id: device.maTB || device._id.toString(),
                    name: device.tenTB || '',
                    quantity: soLuongConLai,
                    category: mappedCategory,
                    condition: condition,
                    location: device.viTriLuuTru || '',
                    origin: device.nguonGoc || '',
                    status: soLuongConLai > 0 ? 'available' : 'borrowed',
                    unit: 'cái', // Mặc định
                    class: '', // Có thể thêm vào model sau
                    description: device.huongDanSuDung || '',
                    images: images // Map from hinhAnh field in DB, ensure it's an array
                };
            }));

            // Lọc bỏ thiết bị không có số lượng sẵn sàng (soLuongConLai = 0) - tức là chỉ có thiết bị hỏng hoặc đã mượn hết
            const availableDevices = mappedDevices.filter(device => device.quantity > 0);

            // Lưu vào cache (TTL 2 phút cho dữ liệu thiết bị)
            cache.set(cacheKey, availableDevices, 120000);

            return availableDevices;
        } catch (error) {
            console.error('Error in getDevices service:', error);
            throw error;
        }
    }

    // Tạo yêu cầu mượn mới (Asynchronous with RabbitMQ)
    async createBorrowRequest(userId, borrowData) {
        try {
            // --- Phần 1: Validation ---
            const mongoose = require('mongoose');
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Người dùng không hợp lệ. Vui lòng đăng nhập lại.');
            }

            if (!borrowData.devices || borrowData.devices.length === 0) {
                throw new Error('Vui lòng chọn ít nhất một thiết bị');
            }

            // Reset time về 00:00:00 để chỉ so sánh ngày
            const borrowDate = new Date(borrowData.borrowDate);
            borrowDate.setHours(0, 0, 0, 0);

            const returnDate = new Date(borrowData.returnDate);
            returnDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (returnDate < borrowDate) {
                throw new Error('Ngày trả phải sau hoặc bằng ngày mượn');
            }

            // Phải đăng ký ít nhất 1 ngày trước
            if (borrowDate < tomorrow) {
                throw new Error('Cần đăng ký sớm hơn (≥1 ngày) trước buổi dạy');
            }

            // --- Phần 2: Publish Message to RabbitMQ ---
            const messagePayload = {
                userId: userId,
                borrowData: borrowData,
                requestedAt: new Date().toISOString()
            };

            // Direct DB creation - SYNC MODE (RabbitMQ disabled for reliability)
            try {
                const ticket = await borrowRepo.createBorrowRequest(userId, borrowData);

                // Clear cache to refresh device availability
                cache.clear();

                return {
                    success: true,
                    message: 'Đăng ký mượn thành công!',
                    data: {
                        maPhieu: ticket.maPhieu,
                        trangThai: ticket.trangThai || 'cho_duyet',
                        ticket: ticket
                    }
                };
            } catch (dbError) {
                console.error('Error creating borrow request:', dbError.message);
                throw new Error(dbError.message || 'Không thể xử lý yêu cầu mượn. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error in createBorrowRequest service:', error);
            throw error;
        }
    }

    // Lấy phiếu mượn theo ID
    async getBorrowSlip(slipId) {
        try {
            const slip = await borrowRepo.getBorrowSlipById(slipId);
            if (!slip) {
                // Nếu không tìm thấy, trả về mockup data để test
                console.warn(`Borrow slip ${slipId} not found, returning mockup data`);
                return this.getMockupBorrowSlip(slipId);
            }
            return slip;
        } catch (error) {
            console.error('Error in getBorrowSlip service:', error);
            // Nếu có lỗi, trả về mockup data
            console.warn('Returning mockup borrow slip due to error');
            return this.getMockupBorrowSlip(slipId);
        }
    }

    // Mockup borrow slip for testing
    getMockupBorrowSlip(slipId) {
        const mongoose = require('mongoose');
        return {
            _id: new mongoose.Types.ObjectId(),
            maPhieu: slipId,
            ngayMuon: new Date(),
            ngayDuKienTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lyDo: 'Dạy học môn Hóa học',
            nguoiLapPhieuId: {
                _id: new mongoose.Types.ObjectId(),
                hoTen: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com',
                role: 'giao_vien'
            },
            trangThai: 'dang_muon',
            sessionTime: 'sang',
            createdAt: new Date(),
            updatedAt: new Date(),
            details: [
                {
                    maPhieu: slipId,
                    maTB: 'TB001',
                    soLuongMuon: 3,
                    ngayTraDuKien: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    tinhTrangLucMuon: 'Bình thường',
                    device: {
                        maTB: 'TB001',
                        tenTB: 'Ống nghiệm thủy tinh',
                        category: { tenDM: 'Hóa học' },
                        viTriLuuTru: 'Phòng thiết bị 2',
                        nguonGoc: 'CC'
                    }
                }
            ]
        };
    }

    // Lấy chi tiết phiếu trả theo ID
    async getReturnSlip(slipId) {
        try {
            const slip = await borrowRepo.getReturnSlipById(slipId);
            if (!slip) {
                throw new Error('Phiếu trả không tồn tại');
            }
            return slip;
        } catch (error) {
            console.error('Error in getReturnSlip service:', error);
            throw error;
        }
    }

    // Lấy lịch sử mượn và trả của user (cả phiếu mượn và phiếu trả)
    async getBorrowHistory(userId, filters = {}) {
        try {
            // Nếu có filter type, chỉ lấy loại đó
            const history = await borrowRepo.getBorrowHistoryByUserId(userId, filters);

            // Filter theo type nếu có
            if (filters.type) {
                return history.filter(item => item.type === filters.type);
            }

            return history;
        } catch (error) {
            console.error('Error in getBorrowHistory service:', error);
            throw error;
        }
    }

    // Lấy danh sách phiếu chờ duyệt của user
    async getPendingApprovals(userId, filters = {}) {
        try {
            // Repository đã có logic mặc định status='cho_duyet'
            const list = await borrowRepo.getPendingApprovals(userId, filters);
            return list;
        } catch (error) {
            console.error('Error in getPendingApprovals service:', error);
            throw error;
        }
    }

    // Hủy phiếu mượn
    async cancelBorrow(slipId) {
        try {
            // In real app: validate permissions, check if status allows cancellation
            // For now, just delete or update status to 'huy'
            // Let's update status to 'huy'
            const result = await borrowRepo.updateBorrowRequestStatus(slipId, 'huy');
            return result;
        } catch (error) {
            console.error('Error in cancelBorrow service:', error);
            throw error;
        }
    }
    // API cho QLTB: Lấy danh sách phiếu mượn đang chờ duyệt
    async getPendingBorrows() {
        // Mock data
        return [
            { id: 'PM001', createdAt: '15/11/2025', note: 'Dạy Tin học 7A', status: 'pending' },
            { id: 'PM002', createdAt: '16/11/2025', note: 'Bộ thí nghiệm Hóa 9B', status: 'pending' }
        ];
    }

    // API cho QLTB: Lấy danh sách phiếu trả đang chờ duyệt
    async getPendingReturns() {
        // Mock data
        return [
            { id: 'PT001', maPhieuMuon: 'PM001', ngayTra: '18/11/2025', status: 'pending' },
            { id: 'PT002', maPhieuMuon: 'PM003', ngayTra: '19/11/2025', status: 'pending' }
        ];
    }

    // API cho QLTB: Duyệt phiếu mượn
    async approveBorrow(slipId, approvedBy) {
        try {
            const ticket = await borrowRepo.approveBorrowRequest(slipId, approvedBy);
            cache.clear(); // Clear cache sau khi duyệt
            return ticket;
        } catch (error) {
            console.error('Error approving borrow:', error);
            throw error;
        }
    }

    // API cho QLTB: Từ chối phiếu mượn
    async rejectBorrow(slipId, reason, rejectedBy) {
        try {
            const ticket = await borrowRepo.rejectBorrowRequest(slipId, reason, rejectedBy);
            cache.clear(); // Clear cache sau khi từ chối
            return ticket;
        } catch (error) {
            console.error('Error rejecting borrow:', error);
            throw error;
        }
    }

    // API cho QLTB: Lấy danh sách phiếu mượn chờ duyệt
    async getPendingBorrowTicketsForManager(filters = {}) {
        try {
            const tickets = await borrowRepo.getPendingBorrowTicketsForManager(filters);
            return tickets;
        } catch (error) {
            console.error('Error getting pending borrow tickets for manager:', error);
            throw error;
        }
    }

    // API cho QLTB: Lấy danh sách phiếu trả
    async getReturnSlipsForManager(filters = {}) {
        try {
            const { ReturnSlip } = require('../models/borrow-ticket.model');
            const query = {};

            if (filters.search) {
                query.$or = [
                    { maPhieuTra: { $regex: filters.search, $options: 'i' } },
                    { maPhieuMuon: { $regex: filters.search, $options: 'i' } }
                ];
            }

            if (filters.createdFrom) {
                query.createdAt = { $gte: new Date(filters.createdFrom) };
            }

            if (filters.createdTo) {
                query.createdAt = { ...query.createdAt, $lte: new Date(filters.createdTo) };
            }

            const slips = await ReturnSlip.find(query)
                .populate('nguoiTraId', 'hoTen email role maNV')
                .sort({ createdAt: -1 })
                .limit(filters.limit || 100);

            // Enrich với ReturnDetails và BorrowTicket
            const enrichedSlips = await Promise.all(slips.map(async (slip) => {
                const returnDetails = await borrowRepo.getReturnSlipById(slip.maPhieuTra);
                return {
                    ...slip.toObject(),
                    details: returnDetails?.details || [],
                    borrowTicket: returnDetails?.borrowTicket || null
                };
            }));

            return enrichedSlips;
        } catch (error) {
            console.error('Error getting return slips for manager:', error);
            throw error;
        }
    }

    // API cho QLTB: Xác nhận trả phiếu (Mock)
    async approveReturn(slipId, confirmedBy) {
        console.log(`QLTB confirmed return ${slipId} by ${confirmedBy}`);
        return { id: slipId, status: 'confirmed' };
    }

    /**
     * Create a return slip for selected borrowed items
     * @param {string} employeeId - ID of the employee processing the return
     * @param {Object} returnSlipData - Return slip data
     * @returns {Promise<Object>} - Created return slip
     */
    async createReturnSlip(employeeId, returnSlipData) {
        try {
            // Validate input
            if (!returnSlipData.borrowedItemIds || returnSlipData.borrowedItemIds.length === 0) {
                throw new Error('Vui lòng chọn ít nhất một thiết bị để trả');
            }

            if (!returnSlipData.returnDate) {
                throw new Error('Vui lòng chọn ngày trả');
            }

            // Normalize return date
            const returnDate = new Date(returnSlipData.returnDate);
            returnDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (returnDate > today) {
                throw new Error('Ngày trả không được là ngày tương lai');
            }

            // Call repository to create return slip
            const result = await borrowRepo.createReturnSlip(
                employeeId,
                returnSlipData.borrowedItemIds,
                {
                    returnDate: returnDate,
                    returnShift: returnSlipData.returnShift || 'sang',
                    notes: returnSlipData.notes || '',
                    quantities: returnSlipData.quantities || {}
                }
            );

            // Invalidate relevant caches (clear all since we don't support wildcard delete)
            cache.clear(); // Clear all cache as inventory changed

            return {
                success: true,
                message: 'Tạo phiếu trả thành công!',
                data: result
            };

        } catch (error) {
            console.error('Error in createReturnSlip service:', error);
            throw error;
        }
    }

    /**
     * Get borrowed items that can be returned
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>} - List of borrowed items
     */
    async getBorrowedItemsForReturn(filters = {}) {
        try {
            const items = await borrowRepo.getBorrowedItemsForReturn(filters);
            return items;
        } catch (error) {
            console.error('Error in getBorrowedItemsForReturn service:', error);
            throw error;
        }
    }

    /**
     * Get active borrow tickets (approved/dang_muon) for return management
     * @param {Object} filters - Filter options  
     * @returns {Promise<Array>} - List of active borrow tickets
     */
    async getActiveBorrowTicketsForReturn(filters = {}) {
        try {
            const tickets = await borrowRepo.getActiveBorrowTicketsForReturn(filters);
            return tickets;
        } catch (error) {
            console.error('Error getting active borrow tickets for return:', error);
            throw error;
        }
    }

}

module.exports = new BorrowService();
