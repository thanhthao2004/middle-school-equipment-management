/**
 * Seed data cho feature acceptance
 * Chạy: node scripts/seed-acceptance.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongo } = require('../src/config/db');

const {
    AcceptanceMinutes,
    AcceptanceDetail
} = require('../src/features/acceptance/models/acceptance.model');

async function seedAcceptance() {
    try {
        console.log('🔌 Kết nối MongoDB...');
        await connectMongo();

        console.log('🧹 Xóa dữ liệu cũ...');
        await AcceptanceMinutes.deleteMany({});
        await AcceptanceDetail.deleteMany({});

        console.log('📄 Tạo biên bản nghiệm thu...');

        const minutesData = [
            { maBienBan: 'NT001', namHoc: '2019-2020', trangThaiNghiemThu: 'Đã nghiệm thu' },
            { maBienBan: 'NT002', namHoc: '2020-2021', trangThaiNghiemThu: 'Đã nghiệm thu' },
            { maBienBan: 'NT003', namHoc: '2021-2022', trangThaiNghiemThu: 'Đã nghiệm thu' },
            { maBienBan: 'NT004', namHoc: '2022-2023', trangThaiNghiemThu: 'Đã nghiệm thu' },
            { maBienBan: 'NT005', namHoc: '2023-2024', trangThaiNghiemThu: 'Đã nghiệm thu' },
            { maBienBan: 'NT006', namHoc: '2024-2025', trangThaiNghiemThu: 'Đã nghiệm thu' },
            { maBienBan: 'NT007', namHoc: '2025-2026', trangThaiNghiemThu: 'Cần nghiệm thu' }
        ];

        const minutes = await AcceptanceMinutes.insertMany(
            minutesData.map(x => ({
                ...x,
                ngayLap: new Date(),
                tenBienBan: `Biên bản nghiệm thu năm học ${x.namHoc}`
            }))
        );

        console.log(`✅ Đã tạo ${minutes.length} biên bản\n`);

        console.log('🧾 Tạo chi tiết nghiệm thu cho NT007 (năm hiện tại)...');

        await AcceptanceDetail.insertMany([
            {
                maBienBan: 'NT007',
                maTB: 'TB001',
                soLuongThucTe: 12,
                chatLuong: 'Tốt',
                lyDo: ''
            },
            {
                maBienBan: 'NT007',
                maTB: 'TB002',
                soLuongThucTe: 8,
                chatLuong: 'Khá',
                lyDo: 'Trầy nhẹ'
            }
        ]);

        console.log('🎉 Seed nghiệm thu thành công');

    } catch (err) {
        console.error('❌ Lỗi seed:', err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Đã đóng MongoDB');
    }
}

if (require.main === module) {
    seedAcceptance()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { seedAcceptance };
