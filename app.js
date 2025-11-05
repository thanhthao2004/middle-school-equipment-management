const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// =======================
//  CẤU HÌNH VIEW ENGINE
// =======================
app.set('view engine', 'ejs');

// Cho phép Express tìm view trong nhiều thư mục
app.set('views', [
  path.join(__dirname, 'src/features/views'),
  path.join(__dirname, 'src/features/auth/views'),
  path.join(__dirname, 'src/features/acceptance/views'),
  path.join(__dirname, 'src/features/borrow/views'),
  path.join(__dirname, 'src/features/disposal/views'),
  path.join(__dirname, 'src/features/returns/views')
]);

// =======================
//  MIDDLEWARE
// =======================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files (Bootstrap + public CSS)
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// =======================
//  TRANG CHỦ
// =======================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trang chủ</title>
      <link href="/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="text-center mb-4">🏫 Middle School Equipment Management</h1>
        <div class="row">
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Quản lý thiết bị</h5>
                <p class="card-text">Xem danh sách các giao diện quản lý</p>
                <a href="/views" class="btn btn-primary">Xem giao diện</a>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Đăng nhập</h5>
                <p class="card-text">Truy cập hệ thống quản lý</p>
                <a href="/auth/login" class="btn btn-success">Đăng nhập</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// =======================
//  ROUTES GIAO DIỆN
// =======================

// Đăng nhập
app.get('/auth/login', (req, res) => {
  res.render('login', { title: 'Đăng nhập hệ thống' });
});

// Biên bản nghiệm thu
app.get('/acceptance', (req, res) => {
  res.render('acceptance_list', {
    user: { name: 'Quản lý thiết bị', role: 'QLTB' },
    report: {
      code: 'NT-2025-001',
      date: '2025-11-05',
      status: 'Hoàn thành',
      details: [
        { name: 'Máy chiếu Epson', category: 'Thiết bị giảng dạy', expected: 2, actual: 2, quality: 'Tốt' },
        { name: 'Laptop Dell', category: 'CNTT', expected: 5, actual: 5, quality: 'Xuất sắc' }
      ]
    }
  });
});

// Báo cáo thanh lý
app.get('/disposal', (req, res) => {
  res.render('DisposalReport', {
    user: { name: 'Quản lý thiết bị', role: 'QLTB' },
    years: ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'],
    reports: [
      { code: 'TL001', year: '2023-2024', total: 3, status: 'Đã thanh lý', note: '3 thiết bị hư hỏng nặng' },
      { code: 'TL002', year: '2024-2025', total: 2, status: 'Đang xử lý', note: 'Chờ duyệt hội đồng' }
    ]
  });
});

// Phiếu mượn thiết bị
app.get('/borrow', (req, res) => {
  res.render('BorrowSlip', {
    user: { name: 'Quản lý thiết bị' },
    departments: ['Tin học', 'Toán', 'Vật lý', 'Sinh học', 'Ngoại ngữ'],
    requests: [
      { code: 'PM001', teacher: 'Nguyễn Văn A', department: 'Tin học', borrowDate: '2025-10-01', returnDate: '2025-10-05', status: 'Chờ duyệt' },
      { code: 'PM002', teacher: 'Trần Thị B', department: 'Vật lý', borrowDate: '2025-10-02', returnDate: '2025-10-06', status: 'Đang mượn' },
      { code: 'PM003', teacher: 'Lê Văn C', department: 'Hóa học', borrowDate: '2025-10-03', returnDate: '2025-10-07', status: 'Đã duyệt' }
    ],
    selectedDetails: [
      { name: 'Bộ dụng cụ thí nghiệm', department: 'Tin học', position: 'Phòng Lab 1', source: 'Trường', borrowDate: '2025-10-01', returnDate: '2025-10-05', quantity: 2, unit: 'bộ', location: 'Phòng học 203', condition: 'Tốt' },
      { name: 'Laptop Dell', department: 'Tin học', position: 'Kho thiết bị', source: 'Dự án', borrowDate: '2025-10-01', returnDate: '2025-10-05', quantity: 1, unit: 'chiếc', location: 'Phòng 205', condition: 'Tốt' }
    ],
    modal: { teacher: 'Nguyễn Văn A', department: 'Tin học', createdAt: '2025-10-01' }
  });
});

// Phiếu trả thiết bị
app.get('/returns', (req, res) => {
  res.render('ReturnSlip', {
    user: { name: 'Quản lý thiết bị' },
    phieuTraList: [
      {
        maPhieu: 'PT001',
        tenGiaoVien: 'Nguyễn Văn A',
        boMon: 'Tin học',
        ngayMuon: '2025-09-20',
        ngayTraDuKien: '2025-09-25',
        ngayTraThucTe: '2025-09-25',
        trangThai: 'Đã trả',
        dsThietBi: [
          { ten: 'Laptop Dell', donVi: 'Chiếc', viTri: 'Phòng Lab', ngayTra: '2025-09-25', soLuong: 2, tinhTrang: 'Tốt' },
          { ten: 'Máy chiếu Epson', donVi: 'Cái', viTri: 'Phòng 203', ngayTra: '2025-09-25', soLuong: 1, tinhTrang: 'Tốt' }
        ]
      }
    ]
  });
});

// =======================
//  DANH SÁCH GIAO DIỆN
// =======================
app.get('/views', (req, res) => {
  res.send(`
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Danh sách giao diện</title>
      <link href="/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="container mt-5">
      <h2 class="mb-4">🧩 Danh sách các giao diện có thể xem</h2>
      <ul class="list-group">
        <li class="list-group-item"><a href="/auth/login">Đăng nhập</a></li>
        <li class="list-group-item"><a href="/acceptance">Biên bản nghiệm thu</a></li>
        <li class="list-group-item"><a href="/borrow">Phiếu mượn thiết bị</a></li>
        <li class="list-group-item"><a href="/returns">Phiếu trả thiết bị</a></li>
        <li class="list-group-item"><a href="/disposal">Báo cáo thanh lý</a></li>
      </ul>
      <a href="/" class="btn btn-secondary mt-4">← Quay lại trang chủ</a>
    </body>
    </html>
  `);
});

// =======================
//  KHỞI CHẠY SERVER
// =======================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running at: http://localhost:${PORT}`));
