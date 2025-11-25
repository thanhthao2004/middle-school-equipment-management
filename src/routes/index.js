/**
 * Routes Aggregator
 * Tập trung tất cả routes của ứng dụng
 * 
 * Pattern: Mỗi feature tự quản lý routes của mình
 * Routes aggregator chỉ import và mount
 */

const express = require('express');
const router = express.Router();

// ==========================
// AUTHENTICATION & PROFILE
// ==========================
router.use('/auth', require('../features/auth/routes/auth.routes'));
router.use('/profile', require('../features/profile/routes/profile.routes'));

// ==========================
// ADMIN (Quản trị viên - users management)
// ==========================
router.use('/admin', require('../features/users/routes/users.routes'));

// ==========================
// MANAGER (Nhân viên quản lý thiết bị - QLTB)
// ==========================
router.use('/manager', require('../features/manager/routes/manager.routes'));

// ==========================
// QLTB FEATURES (Quản lý thiết bị)
// ==========================
router.use('/devices', require('../features/devices/routes/devices.routes'));
router.use('/device-stats', require('../features/device-stats/routes/device-stats.routes'));
router.use('/categories', require('../features/categories/routes/categories.routes'));
router.use('/suppliers', require('../features/suppliers/routes/suppliers.routes'));
router.use('/acceptance', require('../features/acceptance/routes/acceptance.routes'));
router.use('/periodic-reports', require('../features/periodic-reports/routes/periodic-report.routes'));
router.use('/disposal', require('../features/disposal/routes/disposal.routes'));

// ==========================
// TEACHER (Giáo viên bộ môn)
// ==========================
router.use('/borrow', require('../features/borrow/routes/borrow.routes'));

// ==========================
// DEPARTMENT HEAD (Tổ trưởng chuyên môn)
// ==========================
router.use('/reports', require('../features/reports/routes/reports.routes'));
router.use('/training-plans', require('../features/training-plans/routes/training.routes'));
router.use('/purchasing-plans', require('../features/purchasing-plans/routes/purchasing.routes'));

// ==========================
// PRINCIPAL (Hiệu trưởng)
// Note: Routes được mount trong các features tương ứng:
// - /training-plans (xem tất cả)
// - /purchasing-plans/approve (duyệt mua sắm)
// - /disposal/approve (duyệt thanh lý)
// ==========================

// ==========================
// ROOT ROUTES
// ==========================
router.get('/', (req, res) => res.redirect('/borrow/teacher-home'));

module.exports = router;
