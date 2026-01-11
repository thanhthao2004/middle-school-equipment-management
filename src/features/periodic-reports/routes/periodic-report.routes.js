const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const periodicReportController = require('../controllers/periodic.controller');

// Cấu hình multer lưu file báo cáo
const uploadDir = path.join(__dirname, '../../../../public/uploads/devices');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // public/uploads/devices
  },
  filename: (req, file, cb) => {
    // tên vật lý trên ổ đĩa (random để không trùng)
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});


const upload = multer({ storage });

// PAGE ROUTES (GET)
// ==========================

// Danh sách báo cáo định kỳ
// URL: /periodic-reports
router.get('/', periodicReportController.getReportListPage);

// Trang tạo báo cáo
// URL: /periodic-reports/create
router.get('/create', periodicReportController.getCreateReportPage);

// Trang xem chi tiết báo cáo (hoặc chỉnh sửa)
// URL: /periodic-reports/:id
router.get('/:id', periodicReportController.getReportDetailPage);


// ==========================
// ACTION ROUTES (POST)
// ==========================

// Tạo báo cáo mới
// POST /periodic-reports
router.post(
  '/',
  upload.single('reportFile'),          // name="reportFile" trong form
  periodicReportController.createReport
);

// Cập nhật báo cáo
// POST /periodic-reports/:id
router.post('/:id', periodicReportController.updateReport);

// Xóa báo cáo
// POST /periodic-reports/:id/delete
router.post('/:id/delete', periodicReportController.deleteReport);

// Tải file báo cáo
// GET /periodic-reports/:id/download
router.get('/:id/download', periodicReportController.downloadReportFile);

// PLACEHOLDER
// router.post('/:id/item/:itemId/status', controller.updateItemStatus);

// ==========================
module.exports = router;
