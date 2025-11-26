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
                const borrowedDetails = await BorrowDetail.aggregate([
                    { $match: { maTB: device.maTB } },
                    { $group: { 
                        _id: null, 
                        totalBorrowed: { $sum: '$soLuongMuon' },
                        totalReturned: { $sum: '$soLuongDaTra' }
                    }}
                ]);
                
                const totalBorrowed = borrowedDetails[0]?.totalBorrowed || 0;
                const totalReturned = borrowedDetails[0]?.totalReturned || 0;
                const soLuongDangMuon = totalBorrowed - totalReturned;
                const soLuongConLai = Math.max(0, (device.soLuong || 0) - soLuongDangMuon);
                
                return {
                    id: device.maTB || device._id.toString(),
                    name: device.tenTB || '',
                    quantity: soLuongConLai,
                    category: device.category?.tenDM || device.maDM || '',
                    condition: device.tinhTrangThietBi || 'Tốt',
                    location: device.viTriLuuTru || '',
                    origin: device.nguonGoc || '',
                    status: soLuongConLai > 0 ? 'available' : 'borrowed',
                    unit: 'cái', // Mặc định, có thể thêm vào model sau
                    class: '', // Có thể thêm vào model sau
                    description: device.huongDanSuDung || ''
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

    // Tạo yêu cầu mượn mới
    async createBorrowRequest(userId, borrowData) {
        try {
            // --- Phần 1: Validation ---
            // Validate userId
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

            // Phải đăng ký ít nhất 1 ngày trước (tức là >= tomorrow)
            if (borrowDate < tomorrow) {
                throw new Error('Cần đăng ký sớm hơn (≥1 ngày) trước buổi dạy');
            }

            // --- Phần 2: Gửi message tới RabbitMQ ---
            const messagePayload = {
                userId: userId,
                borrowData: borrowData,
                requestedAt: new Date().toISOString()
            };

            // Gửi message tới RabbitMQ
            await publishMessage(messagePayload);

            return {
                success: true,
                message: 'Yêu cầu mượn của bạn đã được tiếp nhận và đang chờ xử lý.'
            };

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
                throw new Error('Phiếu mượn không tồn tại');
            }
            return slip;
        } catch (error) {
            console.error('Error in getBorrowSlip service:', error);
            throw error;
        }
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
