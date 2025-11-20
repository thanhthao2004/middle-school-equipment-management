/**
 * Script để seed data test cho feature borrow
 * Chạy: node scripts/seed-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto'); // Dùng crypto thay vì bcryptjs (built-in Node.js)
const { connectMongo } = require('../src/config/db');

// Import sequence.js trước để Counter model được compile
require('../src/core/libs/sequence');

// Import models
const User = require('../src/features/users/models/user.model');
const Category = require('../src/features/categories/models/category.model');
const Device = require('../src/features/devices/models/device.model');
const { BorrowTicket, BorrowDetail } = require('../src/features/borrow/models/borrow-ticket.model');

// Lấy Counter model đã được compile từ sequence.js
// Nếu chưa có thì tạo mới (trường hợp sequence.js chưa được load)
let Counter = mongoose.models.Counter;
if (!Counter) {
    const { Schema, model } = mongoose;
    const CounterSchema = new Schema(
        {
            _id: { type: String, required: true },
            seq: { type: Number, default: 0 },
        },
        { versionKey: false }
    );
    Counter = model('Counter', CounterSchema);
}

async function seedData() {
    try {
        console.log('🔌 Đang kết nối MongoDB...');
        await connectMongo();
        
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        console.log(`✅ Đã kết nối đến database: ${dbName}\n`);

        // 1. Seed Users
        console.log('👤 Đang tạo users...');
        // Hash password đơn giản cho test (trong production nên dùng bcrypt)
        // Tạo hash đơn giản: sha256(password + salt)
        const salt = 'test-salt-2024';
        const hashedPassword = crypto.createHash('sha256').update('123456' + salt).digest('hex');
        
        const users = [
            {
                maNV: 'NV001',
                hoTen: 'Nguyễn Văn A',
                email: 'teacher1@school.edu.vn',
                soDienThoai: '0901234567',
                diaChi: '123 Đường ABC, Quận 1, TP.HCM',
                chucVu: 'Giáo viên bộ môn',
                role: 'giao_vien',
                matKhauHash: hashedPassword,
                trangThai: 'active'
            },
            {
                maNV: 'NV002',
                hoTen: 'Trần Thị B',
                email: 'teacher2@school.edu.vn',
                soDienThoai: '0902345678',
                diaChi: '456 Đường XYZ, Quận 2, TP.HCM',
                chucVu: 'Giáo viên bộ môn',
                role: 'giao_vien',
                matKhauHash: hashedPassword,
                trangThai: 'active'
            },
            {
                maNV: 'NV003',
                hoTen: 'Lê Văn C',
                email: 'admin@school.edu.vn',
                soDienThoai: '0903456789',
                diaChi: '789 Đường DEF, Quận 3, TP.HCM',
                chucVu: 'Quản lý thiết bị',
                role: 'ql_thiet_bi',
                matKhauHash: hashedPassword,
                trangThai: 'active'
            }
        ];

        // Xóa users cũ nếu có
        await User.deleteMany({});
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Đã tạo ${createdUsers.length} users`);
        console.log('   - User IDs:', createdUsers.map(u => u._id.toString()).join(', '));
        console.log('   - Email: teacher1@school.edu.vn, teacher2@school.edu.vn, admin@school.edu.vn');
        console.log('   - Password: 123456\n');

        // 2. Seed Categories
        console.log('📁 Đang tạo categories...');
        const categories = [
            {
                maDM: 'DM001',
                tenDM: 'Hóa học',
                viTriLuuTru: 'Phòng thiết bị 2'
            },
            {
                maDM: 'DM002',
                tenDM: 'Vật lý',
                viTriLuuTru: 'Phòng thiết bị 3'
            },
            {
                maDM: 'DM003',
                tenDM: 'Tin học',
                viTriLuuTru: 'Phòng IT'
            },
            {
                maDM: 'DM004',
                tenDM: 'Ngữ văn',
                viTriLuuTru: 'Thư viện'
            }
        ];

        await Category.deleteMany({});
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Đã tạo ${createdCategories.length} categories\n`);

        // 3. Seed Devices
        console.log('🔧 Đang tạo devices...');
        const devices = [
            {
                maTB: 'TB001',
                tenTB: 'Ống nghiệm thủy tinh',
                nguonGoc: 'CC',
                soLuong: 50,
                tinhTrangThietBi: 'Tốt',
                viTriLuuTru: 'Phòng thiết bị 2',
                ngayNhap: new Date('2024-01-15'),
                maDM: 'DM001',
                category: createdCategories[0]._id
            },
            {
                maTB: 'TB002',
                tenTB: 'Bình cầu đun nước',
                nguonGoc: 'NCC',
                soLuong: 20,
                tinhTrangThietBi: 'Tốt',
                viTriLuuTru: 'Phòng thiết bị 2',
                ngayNhap: new Date('2024-02-10'),
                maDM: 'DM001',
                category: createdCategories[0]._id
            },
            {
                maTB: 'TB003',
                tenTB: 'Máy tính để bàn',
                nguonGoc: 'Bộ giáo dục',
                soLuong: 30,
                tinhTrangThietBi: 'Tốt',
                viTriLuuTru: 'Phòng IT',
                ngayNhap: new Date('2024-03-01'),
                maDM: 'DM003',
                category: createdCategories[2]._id
            },
            {
                maTB: 'TB004',
                tenTB: 'Máy chiếu projector',
                nguonGoc: 'GV Thanh Th',
                soLuong: 15,
                tinhTrangThietBi: 'Tốt',
                viTriLuuTru: 'Phòng 101',
                ngayNhap: new Date('2024-03-15'),
                maDM: 'DM003',
                category: createdCategories[2]._id
            },
            {
                maTB: 'TB005',
                tenTB: 'Nam châm điện',
                nguonGoc: 'CC',
                soLuong: 25,
                tinhTrangThietBi: 'Tốt',
                viTriLuuTru: 'Phòng thiết bị 3',
                ngayNhap: new Date('2024-01-20'),
                maDM: 'DM002',
                category: createdCategories[1]._id
            },
            {
                maTB: 'TB006',
                tenTB: 'Sách giáo khoa lớp 6',
                nguonGoc: 'Bộ giáo dục',
                soLuong: 100,
                tinhTrangThietBi: 'Tốt',
                viTriLuuTru: 'Thư viện',
                ngayNhap: new Date('2024-01-05'),
                maDM: 'DM004',
                category: createdCategories[3]._id
            }
        ];

        await Device.deleteMany({});
        const createdDevices = await Device.insertMany(devices);
        console.log(`✅ Đã tạo ${createdDevices.length} devices\n`);

        // 4. Seed Borrow Tickets
        console.log('📋 Đang tạo borrow tickets...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const borrowTickets = [
            {
                maPhieu: 'PM0001',
                ngayMuon: tomorrow,
                ngayDuKienTra: nextWeek,
                lyDo: 'Dạy bài thực hành hóa học lớp 8',
                nguoiLapPhieuId: createdUsers[0]._id,
                trangThai: 'dang_muon',
                ghiChu: 'Cần thiết bị cho buổi học thực hành'
            },
            {
                maPhieu: 'PM0002',
                ngayMuon: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
                ngayDuKienTra: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 ngày sau
                lyDo: 'Dạy bài tin học lớp 7',
                nguoiLapPhieuId: createdUsers[1]._id,
                trangThai: 'dang_muon',
                ghiChu: 'Cần máy tính để thực hành'
            }
        ];

        await BorrowTicket.deleteMany({});
        await BorrowDetail.deleteMany({});
        const createdTickets = await BorrowTicket.insertMany(borrowTickets);
        console.log(`✅ Đã tạo ${createdTickets.length} borrow tickets`);

        // 5. Seed Borrow Details
        console.log('📝 Đang tạo borrow details...');
        const borrowDetails = [
            {
                maPhieu: 'PM0001',
                maTB: 'TB001',
                soLuongMuon: 10,
                ngayTraDuKien: nextWeek,
                tinhTrangLucMuon: 'Bình thường',
                soLuongDaTra: 0
            },
            {
                maPhieu: 'PM0001',
                maTB: 'TB002',
                soLuongMuon: 5,
                ngayTraDuKien: nextWeek,
                tinhTrangLucMuon: 'Bình thường',
                soLuongDaTra: 0
            },
            {
                maPhieu: 'PM0002',
                maTB: 'TB003',
                soLuongMuon: 15,
                ngayTraDuKien: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                tinhTrangLucMuon: 'Bình thường',
                soLuongDaTra: 0
            }
        ];

        await BorrowDetail.insertMany(borrowDetails);
        console.log(`✅ Đã tạo ${borrowDetails.length} borrow details\n`);

        // 6. Seed Counters (cho sequence)
        console.log('🔢 Đang tạo counters...');
        await Counter.deleteMany({});
        await Counter.insertMany([
            { _id: 'NV', seq: 3 },
            { _id: 'DM', seq: 4 },
            { _id: 'TB', seq: 6 },
            { _id: 'PM', seq: 2 },
            { _id: 'PT', seq: 0 }
        ]);
        console.log('✅ Đã tạo counters\n');

        console.log('🎉 Hoàn thành seed data!');
        console.log('\n📊 Tóm tắt:');
        console.log(`   - Users: ${createdUsers.length}`);
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - Devices: ${createdDevices.length}`);
        console.log(`   - Borrow Tickets: ${createdTickets.length}`);
        console.log(`   - Borrow Details: ${borrowDetails.length}`);
        console.log('\n💡 Để test feature borrow:');
        console.log('   - User ID để test:', createdUsers[0]._id.toString());
        console.log('   - Email: teacher1@school.edu.vn');
        console.log('   - Password: 123456');

    } catch (error) {
        console.error('❌ Lỗi khi seed data:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
}

// Chạy script
if (require.main === module) {
    seedData()
        .then(() => {
            console.log('\n✅ Script hoàn thành!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Script thất bại:', error);
            process.exit(1);
        });
}

module.exports = { seedData };

