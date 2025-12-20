/**
 * Script migration: Tạo DeviceUnit từ dữ liệu Device hiện có
 * 
 * Chạy: node scripts/migrate-device-units.js
 * 
 * Script này sẽ:
 * 1. Đọc tất cả Device trong DB
 * 2. Với mỗi Device, tạo N DeviceUnit tương ứng với soLuong
 * 3. Mỗi DeviceUnit có mã riêng: TB001-001, TB001-002, ...
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../src/features/devices/models/device.model');
const DeviceUnit = require('../src/features/devices/models/device-unit.model');

async function migrate() {
    try {
        // Kết nối MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equipment_management';
        console.log('Connecting to MongoDB:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Lấy tất cả Device
        const devices = await Device.find({});
        console.log(`\n📦 Found ${devices.length} devices to migrate\n`);

        let totalUnitsCreated = 0;
        let devicesProcessed = 0;

        for (const device of devices) {
            console.log(`\n📋 Processing: ${device.tenTB} (${device.maTB})`);
            console.log(`   - Số lượng: ${device.soLuong}`);
            console.log(`   - Tình trạng gốc: ${device.tinhTrangThietBi || 'Chưa xác định'}`);

            // Kiểm tra xem đã có DeviceUnit chưa
            const existingCount = await DeviceUnit.countDocuments({ maTB: device.maTB });
            if (existingCount > 0) {
                console.log(`   ⚠️  Đã có ${existingCount} đơn vị, bỏ qua...`);
                continue;
            }

            const quantity = device.soLuong || 0;
            if (quantity <= 0) {
                console.log(`   ⚠️  Số lượng = 0, bỏ qua...`);
                continue;
            }

            // Xác định tình trạng mặc định dựa trên tinhTrangThietBi của Device
            let defaultCondition = 'Tốt';
            if (device.tinhTrangThietBi) {
                if (['Tốt', 'Khá', 'Trung bình', 'Hỏng'].includes(device.tinhTrangThietBi)) {
                    defaultCondition = device.tinhTrangThietBi;
                }
            }

            // Tạo các DeviceUnit
            const units = [];
            for (let i = 1; i <= quantity; i++) {
                const maDonVi = `${device.maTB}-${String(i).padStart(3, '0')}`;
                units.push({
                    maDonVi,
                    maTB: device.maTB,
                    deviceId: device._id,
                    soThuTu: i,
                    tinhTrang: defaultCondition,
                    trangThai: 'san_sang',
                    viTriLuuTru: device.viTriLuuTru || '',
                    lichSu: [],
                    ghiChu: ''
                });
            }

            try {
                await DeviceUnit.insertMany(units);
                totalUnitsCreated += units.length;
                devicesProcessed++;
                console.log(`   ✅ Đã tạo ${units.length} đơn vị: ${units[0].maDonVi} → ${units[units.length - 1].maDonVi}`);
            } catch (err) {
                console.error(`   ❌ Lỗi khi tạo đơn vị:`, err.message);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 KẾT QUẢ MIGRATION:');
        console.log(`   - Thiết bị đã xử lý: ${devicesProcessed}/${devices.length}`);
        console.log(`   - Tổng đơn vị đã tạo: ${totalUnitsCreated}`);
        console.log('='.repeat(50));

        // Hiển thị thống kê
        const stats = await DeviceUnit.aggregate([
            {
                $group: {
                    _id: '$tinhTrang',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('\n📈 THỐNG KÊ TÌNH TRẠNG:');
        stats.forEach(s => {
            console.log(`   - ${s._id}: ${s.count} đơn vị`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

// Chạy migration
migrate();

