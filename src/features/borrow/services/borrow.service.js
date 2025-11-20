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

            // Mock data - trong thực tế sẽ gọi database
            const mockDevices = [
                {
                    id: 101,
                    name: "Bộ dụng cụ thí nghiệm H2SO4",
                    category: "chemistry",
                    unit: "cái",
                    class: "8,9",
                    quantity: 3,
                    status: "available",
                    condition: "good",
                    location: "Phòng thiết bị 2",
                    origin: "CC",
                    supplier: "Công ty TNHH Hóa Chất Việt"
                },
                {
                    id: 102,
                    name: "Bộ sách tuổi thơ lớp 8",
                    category: "literature",
                    unit: "bộ",
                    class: "8",
                    quantity: 10,
                    status: "borrowed",
                    condition: "good",
                    location: "Phòng thiết bị 3",
                    origin: "Bộ giáo dục",
                    supplier: "Nhà xuất bản Giáo dục Việt Nam"
                },
                {
                    id: 103,
                    name: "Bộ thí nghiệm Hoá học cơ bản",
                    category: "chemistry",
                    unit: "bộ",
                    class: "8,9",
                    quantity: 5,
                    status: "available",
                    condition: "good",
                    location: "Kho Hóa học",
                    origin: "GV Thanh Th",
                    supplier: "Công ty Thiết bị Giáo dục ABC"
                },
                {
                    id: 104,
                    name: "Laptop Dell Inspiron 3501",
                    category: "it",
                    unit: "cái",
                    class: "6,7,8",
                    quantity: 10,
                    status: "available",
                    condition: "good",
                    location: "Phòng IT",
                    origin: "NCC",
                    supplier: "Công ty TNHH Công nghệ XYZ"
                },
                {
                    id: 105,
                    name: "Bảng tương tác thông minh",
                    category: "it",
                    unit: "cái",
                    class: "6,7,8",
                    quantity: 1,
                    status: "available",
                    condition: "damaged",
                    location: "Phòng 101",
                    origin: "NCC",
                    supplier: "Công ty TNHH Công nghệ XYZ"
                },
                {
                    id: 106,
                    name: "Phim tư liệu về tác phẩm Nam quốc sơn hà",
                    category: "literature",
                    unit: "bộ",
                    class: "1",
                    quantity: 9,
                    status: "borrowed",
                    condition: "good",
                    location: "Thư viện",
                    origin: "NCC",
                    supplier: "Công ty Sản xuất Phim Giáo dục"
                }
            ];

            // Apply filters
            let filteredDevices = mockDevices;

            if (filters.category) {
                filteredDevices = filteredDevices.filter(device => device.category === filters.category);
            }

            if (filters.class) {
                filteredDevices = filteredDevices.filter(device => 
                    device.class.includes(filters.class)
                );
            }

            if (filters.status) {
                filteredDevices = filteredDevices.filter(device => device.status === filters.status);
            }

            if (filters.condition) {
                filteredDevices = filteredDevices.filter(device => device.condition === filters.condition);
            }

            if (filters.location) {
                filteredDevices = filteredDevices.filter(device => device.location === filters.location);
            }

            if (filters.origin) {
                filteredDevices = filteredDevices.filter(device => device.origin === filters.origin);
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredDevices = filteredDevices.filter(device => 
                    device.name.toLowerCase().includes(searchTerm) ||
                    device.id.toString().includes(searchTerm)
                );
            }

            // Lưu vào cache (TTL 2 phút cho dữ liệu thiết bị)
            cache.set(cacheKey, filteredDevices, 120000);

            return filteredDevices;
        } catch (error) {
            console.error('Error in getDevices service:', error);
            throw error;
        }
    }

    // Tạo yêu cầu mượn mới
    async createBorrowRequest(userId, borrowData) {
        try {
            // --- Phần 1: Validation (Vẫn giữ lại) ---
            // (Phần logic này chạy đồng bộ trước khi gửi)
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
            
            // --- Phần 2: Thay đổi logic ---
            // Thay vì tạo slipId và lưu vào DB/mock...
            // ...chúng ta tạo một payload (gói tin)
            const messagePayload = {
                userId: userId,
                borrowData: borrowData,
                requestedAt: new Date().toISOString()
            };

            // Gửi message tới RabbitMQ
            await publishMessage(messagePayload);
            
            // Trả về thông báo thành công ngay lập...
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
            // Mock data - trong thực tế sẽ gọi database
            const mockSlip = {
                id: slipId,
                userId: 1,
                userName: "Nguyễn Văn A",
                userRole: "Giáo viên bộ môn",
                devices: [
                    {
                        id: 101,
                        name: "Bộ dụng cụ thí nghiệm H2SO4",
                        category: "Hóa học",
                        unit: "cái",
                        quantity: 2,
                        location: "Phòng thiết bị 2"
                    },
                    {
                        id: 104,
                        name: "Laptop Dell Inspiron 3501",
                        category: "Tin học",
                        unit: "cái",
                        quantity: 1,
                        location: "Phòng IT"
                    }
                ],
                borrowDate: "2024-01-15",
                returnDate: "2024-01-22",
                sessionTime: "sang",
                content: "Dạy thí nghiệm hóa học lớp 8A",
                status: "approved",
                createdAt: "2024-01-10T08:30:00Z",
                approvedBy: "Cô Nguyễn Thị B",
                approvedAt: "2024-01-10T14:20:00Z"
            };

            return mockSlip;
        } catch (error) {
            console.error('Error in getBorrowSlip service:', error);
            throw error;
        }
    }

    // Lấy lịch sử mượn của user
    async getBorrowHistory(userId, filters = {}) {
        try {
            // Mock data - trong thực tế sẽ gọi database
            const mockHistory = [
                {
                    id: "PM001",
                    devices: ["Bộ dụng cụ thí nghiệm H2SO4", "Laptop Dell Inspiron 3501"],
                    borrowDate: "2024-01-15",
                    returnDate: "2024-01-22",
                    status: "completed",
                    createdAt: "2024-01-10T08:30:00Z"
                },
                {
                    id: "PM002",
                    devices: ["Bộ thí nghiệm Hoá học cơ bản"],
                    borrowDate: "2024-01-20",
                    returnDate: "2024-01-27",
                    status: "pending",
                    createdAt: "2024-01-18T10:15:00Z"
                }
            ];

            return mockHistory;
        } catch (error) {
            console.error('Error in getBorrowHistory service:', error);
            throw error;
        }
    }

    // Lấy danh sách phiếu chờ duyệt của user
    async getPendingApprovals(userId, filters = {}) {
        // Mock list of pending slips
        const mock = [
            { id: 'PM1', createdAt: '2025-09-10', status: 'pending' },
            { id: 'PM2', createdAt: '2025-09-10', status: 'pending' },
            { id: 'PM3', createdAt: '2025-09-10', status: 'pending' }
        ];

        let list = mock;
        if (filters.id) list = list.filter(x => x.id.toLowerCase().includes(filters.id.toLowerCase()));
        if (filters.search) list = list.filter(x => x.id.toLowerCase().includes(filters.search.toLowerCase()));
        if (filters.createdFrom) list = list.filter(x => x.createdAt >= filters.createdFrom);
        if (filters.createdTo) list = list.filter(x => x.createdAt <= filters.createdTo);
        return list;
    }

    // Hủy phiếu mượn (mock)
    async cancelBorrow(slipId) {
        // In real app: validate permissions, update DB, restore quantities
        return { id: slipId, status: 'canceled' };
    }
}

module.exports = new BorrowService();
