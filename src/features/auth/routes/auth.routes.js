const express = require('express');
const router = express.Router();

// Giao diện ReturnSlip
router.get('/returns', (req, res) => {
  res.render('ReturnSlip', {
    user: { name: 'Quản lý thiết bị', role: 'QLTB' },
    returns: [],
    devices: [],
    note: 'Tất cả thiết bị đã được trả đúng hạn và trong tình trạng tốt.'
  });
});

module.exports = router;
app.get('/tra-thiet-bi', (req, res) => {
  const phieuTraList = [
    {
      maPhieu: 'P001',
      tenGiaoVien: 'Nguyen Van A',
      boMon: 'Tin học',
      ngayMuon: '2025-09-20',
      ngayTraDuKien: '2025-09-25',
      ngayTraThucTe: '2025-09-25',
      trangThai: 'Đã trả',
      dsThietBi: [
        { ten: 'Bộ dụng cụ', donVi: 'Hóa', viTri: 'Phòng NC', ngayTra: '30/09/2025', soLuong: 3, tinhTrang: 'Tốt' },
        { ten: 'Laptop Dell', donVi: 'Tin', viTri: 'Phòng NC', ngayTra: '10/10/2025', soLuong: 3, tinhTrang: 'Tốt' }
      ]
    },
    // thêm các phiếu khác...
  ];
  res.render('traThietBiList', { phieuTraList });
});

