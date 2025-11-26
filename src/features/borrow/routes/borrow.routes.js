// Borrow Routes
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const { authenticate,requireRole } = require('../../../core/middlewares/auth.middleware');
const { validate } = require('../../../core/middlewares/validation.middleware');
const borrowValidators = require('../validators/borrow.validators');

// Apply auth middleware to all routes
router.use(authenticate);

// =============================================
// TEACHER ROUTES (Giáo viên bộ môn)
// =============================================
// GET /borrow - Đăng ký mượn thiết bị (register)
router.get('/', borrowController.getRegisterPage);
router.get('/register', borrowController.getRegisterPage); // Legacy

// POST /borrow - Xử lý đăng ký mượn
router.post('/', 
    validate(borrowValidators.createBorrowRequest),
    borrowController.createBorrowRequest
);
router.post('/register', 
    validate(borrowValidators.createBorrowRequest),
    borrowController.createBorrowRequest
); // Legacy

// GET /borrow/pending - Xem chờ duyệt
router.get('/pending', borrowController.getPendingApprovalsPage);
router.get('/pending-approvals', borrowController.getPendingApprovalsPage); // Legacy

// GET /borrow/history - Lịch sử mượn/trả
router.get('/history', borrowController.getHistoryPage);

// GET /borrow/teacher-home - Trang chủ giáo viên (PHẢI ĐẶT TRƯỚC /:id)
router.get('/teacher-home', borrowController.getTeacherHomePage);

// GET /borrow/return/:id - Xem chi tiết phiếu trả (cho giáo viên)
router.get('/return/:id', borrowController.getReturnSlipForTeacher);

// GET /borrow/:id - Xem chi tiết phiếu mượn (PHẢI ĐẶT SAU các route cụ thể)
router.get('/:id', borrowController.getBorrowSlip);
router.get('/slip/:id', borrowController.getBorrowSlip); // Legacy

// POST /borrow/:id/cancel - Hủy phiếu phiếu mượn
router.post('/:id/cancel', borrowController.cancelBorrow);

// =============================================
// QLTB ROUTES (Duyệt mượn/trả)
// =============================================
// POST /borrow/approve/:id - Duyệt phiếu mượn
//router.post('/approve/:id', borrowController.approveBorrowSlip);

// POST /borrow/return/:id - Duyệt trả thiết bị
//router.post('/return/:id', borrowController.approveReturnSlip);

// =============================================
// API ROUTES
// =============================================
// API: GET /borrow/api/devices - Lấy danh sách thiết bị
router.get('/api/devices', borrowController.getDevices);

// API: GET /borrow/api/history - Lấy lịch sử mượn/trả
router.get('/api/history', borrowController.getHistoryApi);

// API: GET /borrow/api/pending - Lấy danh sách phiếu chờ duyệt
router.get('/api/pending', borrowController.getPendingApprovals);
router.get('/api/pending-approvals', borrowController.getPendingApprovals); // Legacy

// API: POST /borrow/api/cancel/:id - Hủy phiếu mượn (API)
router.post('/api/cancel/:id', borrowController.cancelBorrow);

module.exports = router;
