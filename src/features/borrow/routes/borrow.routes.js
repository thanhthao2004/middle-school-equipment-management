// Borrow Routes
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const { authenticate,requireRole } = require('../../../core/middlewares/auth.middleware');
const { validate } = require('../../../core/middlewares/validation.middleware');
const borrowValidators = require('../validators/borrow.validators');

// Apply auth middleware to all routes
router.use(authenticate);
// GET Routes - Pages
router.get('/register', borrowController.getRegisterPage);
router.get('/history', borrowController.getHistoryPage);
router.get('/status', borrowController.getStatusPage);
router.get('/pending-approvals', borrowController.getPendingApprovalsPage);
router.get('/teacher-home', borrowController.getTeacherHomePage);
router.get('/slip/:id', borrowController.getBorrowSlip);

// POST Routes - Actions
router.post('/register', 
    validate(borrowValidators.createBorrowRequest),
    borrowController.createBorrowRequest
);

// API Routes
router.get('/api/devices', borrowController.getDevices);
router.get('/api/pending-approvals', borrowController.getPendingApprovals);
router.post('/api/cancel/:id', borrowController.cancelBorrow);
router.get('/api/history', borrowController.getHistoryApi);


router.get(
    '/manager/manager-home',
    requireRole('ql_thiet_bi'),
    borrowController.getManagerHomePage
);

// LIST Borrow Slips Pending
router.get(
    '/manager/approvals',
    requireRole('ql_thiet_bi'),
    borrowController.getApprovalsPage
);

// RETURN SLIPS LIST
router.get(
    '/manager/return-slips',
    requireRole('ql_thiet_bi'),
    borrowController.getReturnSlipsListPage
);

// BORROW DETAIL
router.get(
    '/manager/borrow/:id',
    requireRole('ql_thiet_bi'),
    borrowController.getBorrowDetailPage
);

// RETURN DETAIL
router.get(
    '/manager/return/:id',
    requireRole('ql_thiet_bi'),
    borrowController.getReturnSlipDetailPage
);

// =============================================
// MANAGER API
// =============================================

// API Borrow Slips Pending
router.get(
    '/manager/api/borrow/pending',
    requireRole('ql_thiet_bi'),
    borrowController.getPendingBorrowSlips
);

// API Return Slips Pending
router.get(
    '/manager/api/return/pending',
    requireRole('ql_thiet_bi'),
    borrowController.getPendingReturnSlips
);

// APPROVE / REJECT
router.post(
    '/manager/api/borrow/approve/:id',
    requireRole('ql_thiet_bi'),
    borrowController.approveBorrowSlip
);
router.post(
    '/manager/api/borrow/reject/:id',
    requireRole('ql_thiet_bi'),
    borrowController.rejectBorrowSlip
);

router.post(
    '/manager/api/return/approve/:id',
    requireRole('ql_thiet_bi'),
    borrowController.approveReturnSlip
);
router.post(
    '/manager/api/return/reject/:id',
    requireRole('ql_thiet_bi'),
    borrowController.rejectReturnSlip
);

module.exports = router;
