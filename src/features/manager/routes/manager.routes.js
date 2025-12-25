// Manager Routes - Nhân viên quản lý thiết bị (QLTB)
const express = require('express');
const router = express.Router();
const borrowController = require('../../borrow/controllers/borrow.controller');
const { authenticate, requireRole } = require('../../../core/middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authenticate);
router.use(requireRole('ql_thiet_bi'));

// Trang chủ QLTB - root route
router.get('/', borrowController.getManagerHomePage);
router.get('/manager-home', borrowController.getManagerHomePage);

// NOTE: Borrow and return routes are now handled by manager-borrow.routes.js
// mounted at /manager/borrow in routes/index.js
// The routes below were causing conflicts and have been removed:
// - /approvals -> now /manager/borrow/approvals
// - /return-slips -> now /manager/borrow/returns  
// - /borrow/:id -> now /manager/borrow/approvals/:id
// - /return/:id -> now /manager/borrow/returns/:id

// =============================================
// MANAGER API
// =============================================

// API Borrow Slips Pending
router.get('/api/borrow/pending', borrowController.getPendingBorrowSlips);

// API Return Slips Pending
router.get('/api/return/pending', borrowController.getPendingReturnSlips);

// APPROVE / REJECT
router.post('/api/borrow/approve/:id', borrowController.approveBorrowSlip);
router.post('/api/borrow/reject/:id', borrowController.rejectBorrowSlip);
router.post('/api/return/approve/:id', borrowController.approveReturnSlip);
router.post('/api/return/reject/:id', borrowController.rejectReturnSlip);

module.exports = router;

