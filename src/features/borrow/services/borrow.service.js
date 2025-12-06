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
                // Tính số lượng đã mượn (chưa trả) từ BorrowDetail
                // Nếu là mockup device (có _id bắt đầu bằng 'mock'), skip aggregate
                let soLuongConLai = device.soLuong || 0;

                if (device.maTB && !device._id.toString().startsWith('mock')) {
                    try {
                        const borrowedDetails = await BorrowDetail.aggregate([
                            { $match: { maTB: device.maTB } },
                            {
                                $group: {
                                    _id: null,
                                    totalBorrowed: { $sum: '$soLuongMuon' },
                                    totalReturned: { $sum: '$soLuongDaTra' }
                                }
                            }
                        ]);

                        const totalBorrowed = borrowedDetails[0]?.totalBorrowed || 0;
                        const totalReturned = borrowedDetails[0]?.totalReturned || 0;
                        const soLuongDangMuon = totalBorrowed - totalReturned;
                        soLuongConLai = Math.max(0, (device.soLuong || 0) - soLuongDangMuon);
                    } catch (err) {
                        // Nếu aggregate fail (DB chưa có data), dùng số lượng gốc
                        console.warn('Error calculating borrowed quantity, using original quantity:', err.message);
                    }
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
                    images: device.hinhAnh || [] // Map from hinhAnh field in DB
                };
            }));

            // Lưu vào cache (TTL 2 phút cho dữ liệu thiết bị)
            cache.set(cacheKey, mappedDevices, 120000);

            return mappedDevices;
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

            // Generate temporary ticket ID
            const tempMaPhieu = 'PM_' + Date.now().toString().slice(-8);

            try {
                // Try to publish message to RabbitMQ
                await publishMessage(messagePayload);
                console.log(`Published borrow request message for user ${userId}`);

                // Return pending status immediately
                return {
                    success: true,
                    message: 'Đăng ký mượn thành công! Yêu cầu đang được xử lý.',
                    data: {
                        maPhieu: tempMaPhieu,
                        trangThai: 'pending',
                        tempTicket: {
                            maPhieu: tempMaPhieu,
                            ngayMuon: borrowData.borrowDate,
                            ngayDuKienTra: borrowData.returnDate,
                            trangThai: 'pending',
                            createdAt: new Date()
                        }
                    }
                };
            } catch (mqError) {
                // If RabbitMQ fails, fallback to direct DB creation
                console.warn('RabbitMQ not available, falling back to direct DB creation:', mqError.message);

                try {
                    const ticket = await borrowRepo.createBorrowRequest(userId, borrowData);
                    return {
                        success: true,
                        message: 'Đăng ký mượn thành công!',
                        data: {
                            maPhieu: ticket.maPhieu || tempMaPhieu,
                            trangThai: ticket.trangThai || 'dang_muon',
                            ticket: ticket
                        }
                    };
                } catch (dbError) {
                    console.error('Both RabbitMQ and direct DB creation failed:', dbError.message);
                    throw new Error('Không thể xử lý yêu cầu mượn. Vui lòng thử lại sau.');
                }
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
            // Force status filter to 'dang_muon' (pending) if not specified?
            // Or just pass filters.
            const pendingFilters = { ...filters, status: 'dang_muon' };
            const list = await borrowRepo.getPendingApprovals(userId, pendingFilters);
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

    // API cho QLTB: Duyệt phiếu mượn (Mock)
    async approveBorrow(slipId, approvedBy) {
        console.log(`✅ QLTB approved borrow ${slipId} by ${approvedBy}`);
        return { id: slipId, status: 'approved' };
    }

    // API cho QLTB: Từ chối phiếu mượn (Mock)
    async rejectBorrow(slipId, reason) {
        console.log(`❌ QLTB rejected borrow ${slipId} because: ${reason}`);
        return { id: slipId, status: 'rejected' };
    }

    // API cho QLTB: Xác nhận trả phiếu (Mock)
    async approveReturn(slipId, confirmedBy) {
        console.log(`✅ QLTB confirmed return ${slipId} by ${confirmedBy}`);
        return { id: slipId, status: 'confirmed' };
    }


}

module.exports = new BorrowService();
