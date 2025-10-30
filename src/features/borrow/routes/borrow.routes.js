// Borrow Routes
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const authMiddleware = require('../../../core/middlewares/auth.middleware');
const validationMiddleware = require('../../../core/middlewares/validation.middleware');
const borrowValidators = require('../validators/borrow.validators');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET Routes - Pages
router.get('/register', borrowController.getRegisterPage);
router.get('/history', borrowController.getHistoryPage);
router.get('/status', borrowController.getStatusPage);
router.get('/pending-approvals', borrowController.getPendingApprovalsPage);
router.get('/teacher-home', borrowController.getTeacherHomePage);
router.get('/slip/:id', borrowController.getBorrowSlip);

// POST Routes - Actions
router.post('/register', 
    validationMiddleware(borrowValidators.createBorrowRequest),
    borrowController.createBorrowRequest
);

// API Routes
router.get('/api/devices', borrowController.getDevices);
router.get('/api/pending-approvals', borrowController.getPendingApprovals);
router.post('/api/cancel/:id', borrowController.cancelBorrow);
router.get('/api/history', borrowController.getHistoryApi);

module.exports = router;
