// Device Stats Routes - Quản lý thiết bị (QLTB)
const express = require('express');
const router = express.Router();
const deviceStatsController = require('../controllers/device-stats.controller');
const { authenticate, requireRole } = require('../../../core/middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authenticate);
router.use(requireRole('ql_thiet_bi'));

// GET /device-stats - Trang thống kê thiết bị
router.get('/', deviceStatsController.getOverviewPage);

module.exports = router;

