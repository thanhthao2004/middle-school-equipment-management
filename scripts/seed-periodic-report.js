require('dotenv').config();
const mongoose = require('mongoose');

const PeriodicReport = require('../src/features/periodic-reports/models/periodic-report.model');

async function seed() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Thiếu MONGODB_URI trong file .env');
  }

  await mongoose.connect(mongoUri);

  // Xóa dữ liệu cũ
  await PeriodicReport.deleteMany({});

  // Thêm dữ liệu mẫu
  await PeriodicReport.insertMany([
    {
      maBaoCao: 'BC001',
      kyBaoCao: 'Học kỳ I 2023-2024',
      ngayLap: new Date('2024-01-10'),
      trangThaiBaoCao: 'completed',
      tenFile: 'BaoCao_HK1_2023_2024.pdf',
      duongDanFile: '#'
    },
    {
      maBaoCao: 'BC002',
      kyBaoCao: 'Học kỳ II 2023-2024',
      ngayLap: new Date('2024-06-05'),
      trangThaiBaoCao: 'completed',
      tenFile: 'BaoCao_HK2_2023_2024.pdf',
      duongDanFile: '#'
    },
    {
      maBaoCao: 'BC003',
      kyBaoCao: 'Học kỳ I 2024-2025',
      ngayLap: new Date('2025-01-08'),
      trangThaiBaoCao: 'pending',
      tenFile: 'BaoCao_HK1_2024_2025.pdf',
      duongDanFile: '#'
    },
    {
      maBaoCao: 'BC004',
      kyBaoCao: 'Học kỳ II 2024-2025',
      ngayLap: new Date('2025-05-20'),
      trangThaiBaoCao: 'pending',
      tenFile: 'BaoCao_HK2_2024_2025.pdf',
      duongDanFile: '#'
    }
  ]);

  console.log('✅ Seed báo cáo định kỳ thành công (4 bản ghi)');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
