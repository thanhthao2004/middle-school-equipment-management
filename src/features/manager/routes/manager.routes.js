// Manager Routes - Nhân viên quản lý thiết bị (QLTB)
const express = require('express');
const router = express.Router();
const borrowController = require('../../borrow/controllers/borrow.controller');
const { authenticate, requireRole } = require('../../../core/middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authenticate);
router.use(requireRole('ql_thiet_bi'));

// Trang chủ QLTB
router.get('/manager-home', borrowController.getManagerHomePage);

// Danh sách phiếu mượn chờ duyệt
router.get('/approvals', borrowController.getApprovalsPage);

// Danh sách phiếu trả
router.get('/return-slips', borrowController.getReturnSlipsListPage);

// Chi tiết phiếu mượn
router.get('/borrow/:id', borrowController.getBorrowDetailPage);

// Chi tiết phiếu trả
router.get('/return/:id', borrowController.getReturnSlipDetailPage);

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

