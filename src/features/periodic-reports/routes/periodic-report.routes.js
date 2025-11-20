const express = require('express');
const router = express.Router();
const periodicReportController = require('../controllers/periodic.controller');

// ==========================
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
router.post('/', periodicReportController.createReport);

// Cập nhật báo cáo
// POST /periodic-reports/:id
router.post('/:id', periodicReportController.updateReport);

// Xóa báo cáo
// POST /periodic-reports/:id/delete
router.post('/:id/delete', periodicReportController.deleteReport);

// Tải file báo cáo
// GET /periodic-reports/:id/download
router.get('/:id/download', periodicReportController.downloadReportFile);


// ==========================
module.exports = router;
