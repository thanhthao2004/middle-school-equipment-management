// Profile Routes - Quản lý thông tin cá nhân (cho tất cả actors)
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
// const { authenticate } = require('../../../core/middlewares/auth.middleware');
// const { validate } = require('../../../core/middlewares/validation.middleware');
// const profileValidators = require('../validators/profile.validators');

// Apply auth middleware to all routes (tạm thời bỏ qua để frontend chạy được)
// router.use(authenticate);

// =============================================
// PROFILE ROUTES
// =============================================
// GET /profile - Xem thông tin cá nhân
router.get('/', profileController.getProfilePage);

// POST /profile - Cập nhật thông tin cá nhân
router.post('/', 
    // validate(profileValidators.updateProfile), // Tạm thời bỏ qua validation
    profileController.updateProfile
);

// =============================================
// PASSWORD CHANGE ROUTES
// =============================================
// GET /profile/password/change - Form đổi mật khẩu cá nhân
router.get('/password/change', profileController.getChangePasswordPage);

// POST /profile/password/change - Xử lý đổi mật khẩu cá nhân
router.post('/password/change',
    // validate(profileValidators.changePassword), // Tạm thời bỏ qua validation
    profileController.changePassword
);

module.exports = router;
