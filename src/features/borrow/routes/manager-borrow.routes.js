// Manager Borrow Routes (QLTB)
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const { authenticate, requireRole } = require('../../../core/middlewares/auth.middleware');

// Apply auth middleware - chỉ QLTB mới được truy cập
router.use(authenticate);
router.use(requireRole('ql_thiet_bi'));

// =============================================
// BORROW APPROVAL ROUTES (Duyệt phiếu mượn)
// =============================================
// GET /manager/borrow/approvals - Danh sách phiếu mượn chờ duyệt
router.get('/approvals', borrowController.getBorrowApprovalsPage);

// GET /manager/borrow/approvals/api - API lấy danh sách phiếu mượn chờ duyệt
router.get('/approvals/api', borrowController.getBorrowApprovalsApi);

// GET /manager/borrow/approvals/:id - Chi tiết phiếu mượn
router.get('/approvals/:id', borrowController.getBorrowDetailForManager);

// POST /manager/borrow/approvals/:id/approve - Duyệt phiếu mượn
router.post('/approvals/:id/approve', borrowController.approveBorrowSlipForManager);

// POST /manager/borrow/approvals/:id/reject - Từ chối phiếu mượn
router.post('/approvals/:id/reject', borrowController.rejectBorrowSlipForManager);

// =============================================
// RETURN MANAGEMENT ROUTES (Quản lý phiếu trả)
// =============================================
// GET /manager/borrow/returns - Danh sách phiếu trả
router.get('/returns', borrowController.getReturnSlipsListPage);

// GET /manager/borrow/returns/api - API lấy danh sách phiếu trả
router.get('/returns/api', borrowController.getReturnSlipsApi);

// GET /manager/borrow/returns/create - Trang tạo phiếu trả
router.get('/returns/create', borrowController.getCreateReturnSlipPage);

// GET /manager/borrow/returns/:id - Chi tiết phiếu trả
router.get('/returns/:id', borrowController.getReturnSlipDetailForManager);

// POST /manager/borrow/returns - Tạo phiếu trả mới
router.post('/returns', borrowController.createReturnSlipForManager);

// GET /manager/borrow/returns/borrowed-items/api - API lấy danh sách thiết bị đang mượn (cho tạo phiếu trả)
router.get('/returns/borrowed-items/api', borrowController.getBorrowedItemsForReturn);

module.exports = router;

