
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

// ==========================
// QLTB FEATURES (Quản lý thiết bị)
// Mount dưới /manager để nhất quán với routing structure
// ==========================
router.use('/manager/devices', require('../features/devices/routes/devices.routes'));
router.use('/manager/device-stats', require('../features/device-stats/routes/device-stats.routes'));
router.use('/manager/categories', require('../features/categories/routes/categories.routes'));
router.use('/manager/suppliers', require('../features/suppliers/routes/suppliers.routes'));
router.use('/manager/acceptance', require('../features/acceptance/routes/acceptance.routes'));
router.use('/manager/periodic-reports', require('../features/periodic-reports/routes/periodic-report.routes'));
router.use('/manager/disposal', require('../features/disposal/routes/disposal.routes'));

router.use('/manager', require('../features/manager/routes/manager.routes'));

// ==========================
// TEACHER (Giáo viên bộ môn)
// ==========================
// Root route cho teacher - redirect đến trang chủ
router.get('/teacher', (req, res) => res.redirect('/teacher/borrow/teacher-home'));
router.use('/teacher/borrow', require('../features/borrow/routes/borrow.routes'));

// ==========================
// DEPARTMENT HEAD (Tổ trưởng chuyên môn)
// Note: Tổ trưởng chuyên môn thực chất là role giáo viên nhưng có thêm các chức năng
// Các routes này nằm dưới /teacher vì tổ trưởng là giáo viên + thêm chức năng
// ==========================
router.use('/teacher/reports', require('../features/reports/routes/reports.routes'));
// Legacy route for reports
// router.use('/reports', require('../features/reports/routes/reports.routes'));
router.use('/teacher/training-plans', require('../features/training-plans/routes/training.routes'));
router.use('/teacher/purchasing-plans', require('../features/purchasing-plans/routes/purchasing.routes'));

// ==========================
// PRINCIPAL (Hiệu trưởng)
// ==========================
// Root route cho principal - redirect đến trang chủ
router.get('/principal', (req, res) => {
    res.render('training-plans/views/principal-home', {
        title: 'Trang chủ Hiệu trưởng',
        currentPage: 'principal-home',
        user: req.user || { role: 'hieu_truong', name: 'Hiệu trưởng' }
    });
});

// Principal có thể xem tất cả training-plans
router.use('/principal/training-plans', require('../features/training-plans/routes/training.routes'));

// Principal có thể duyệt mua sắm
const purchasingRoutes = require('../features/purchasing-plans/routes/purchasing.routes');
router.use('/principal/purchasing-plans', purchasingRoutes);

// Principal có thể duyệt thanh lý
const disposalRoutes = require('../features/disposal/routes/disposal.routes');
router.use('/principal/disposal', disposalRoutes);

// ==========================
// ROOT ROUTES
// ==========================
router.get('/', (req, res) => res.redirect('/teacher/borrow/teacher-home'));

module.exports = router;
