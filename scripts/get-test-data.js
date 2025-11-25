/**
 * Script để lấy data test cho feature borrow
 * Chạy: node scripts/get-test-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongo } = require('../src/config/db');

// Import models
const User = require('../src/features/users/models/user.model');
const Category = require('../src/features/categories/models/category.model');
const Device = require('../src/features/devices/models/device.model');
const { BorrowTicket, BorrowDetail } = require('../src/features/borrow/models/borrow-ticket.model');

async function getTestData() {
    try {
        console.log('🔌 Đang kết nối MongoDB...');
        await connectMongo();
        
        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        console.log(`✅ Đã kết nối đến database: ${dbName}\n`);

        // 1. Lấy Users
        console.log('👤 Danh sách Users:');
        const users = await User.find({}).select('_id maNV hoTen email role');
        console.log(`   Tổng số: ${users.length}`);
        users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.hoTen} (${user.email})`);
            console.log(`      - ID: ${user._id}`);
            console.log(`      - Mã NV: ${user.maNV}`);
            console.log(`      - Role: ${user.role}`);
        });
        console.log('');

        // 2. Lấy Categories
        console.log('📁 Danh sách Categories:');
        const categories = await Category.find({});
        console.log(`   Tổng số: ${categories.length}`);
        categories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.tenDM} (${cat.maDM})`);
        });
        console.log('');

        // 3. Lấy Devices
        console.log('🔧 Danh sách Devices:');
        const devices = await Device.find({}).populate('category', 'tenDM');
        console.log(`   Tổng số: ${devices.length}`);
        devices.forEach((device, index) => {
            console.log(`   ${index + 1}. ${device.tenTB} (${device.maTB})`);
            console.log(`      - Số lượng: ${device.soLuong}`);
            console.log(`      - Vị trí: ${device.viTriLuuTru}`);
            console.log(`      - Danh mục: ${device.category?.tenDM || device.maDM}`);
        });
        console.log('');

        // 4. Lấy Borrow Tickets
        console.log('📋 Danh sách Borrow Tickets:');
        const tickets = await BorrowTicket.find({})
            .populate('nguoiLapPhieuId', 'hoTen email')
            .sort({ createdAt: -1 });
        console.log(`   Tổng số: ${tickets.length}`);
        tickets.forEach((ticket, index) => {
            console.log(`   ${index + 1}. ${ticket.maPhieu}`);
            console.log(`      - Người lập: ${ticket.nguoiLapPhieuId?.hoTen || 'N/A'}`);
            console.log(`      - Trạng thái: ${ticket.trangThai}`);
            console.log(`      - Ngày mượn: ${ticket.ngayMuon?.toLocaleDateString('vi-VN') || 'N/A'}`);
            console.log(`      - Ngày trả dự kiến: ${ticket.ngayDuKienTra?.toLocaleDateString('vi-VN') || 'N/A'}`);
        });
        console.log('');

        // 5. Lấy Borrow Details
        console.log('📝 Danh sách Borrow Details:');
        const details = await BorrowDetail.find({}).sort({ createdAt: -1 });
        console.log(`   Tổng số: ${details.length}`);
        details.forEach((detail, index) => {
            console.log(`   ${index + 1}. Phiếu: ${detail.maPhieu}, Thiết bị: ${detail.maTB}`);
            console.log(`      - Số lượng mượn: ${detail.soLuongMuon}`);
            console.log(`      - Số lượng đã trả: ${detail.soLuongDaTra}`);
        });
        console.log('');

        // 6. Tổng hợp thông tin test
        console.log('💡 Thông tin để test feature borrow:');
        if (users.length > 0) {
            const testUser = users[0];
            console.log(`   - User ID để test: ${testUser._id}`);
            console.log(`   - Email: ${testUser.email}`);
            console.log(`   - Mã NV: ${testUser.maNV}`);
        }
        if (devices.length > 0) {
            console.log(`   - Số lượng devices có sẵn: ${devices.length}`);
            console.log(`   - Device IDs: ${devices.slice(0, 3).map(d => d._id).join(', ')}`);
        }
        if (tickets.length > 0) {
            console.log(`   - Số lượng phiếu mượn: ${tickets.length}`);
            console.log(`   - Phiếu mượn IDs: ${tickets.map(t => t._id).join(', ')}`);
        }

    } catch (error) {
        console.error('❌ Lỗi khi lấy data:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
}

// Chạy script
if (require.main === module) {
    getTestData()
        .then(() => {
            console.log('\n Script hoàn thành!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n Script thất bại:', error);
            process.exit(1);
        });
}

module.exports = { getTestData };

