const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// const { validate } = require('../../../core/middlewares/validation.middleware');
// const authValidators = require('../validators/auth.validators'); // Tương lai sẽ thêm validator

// GET /auth/login - Hiển thị form đăng nhập
router.get('/login', authController.getLoginPage);

// POST /auth/login - Xử lý đăng nhập
router.post('/login', authController.handleLogin);

// GET /auth/logout - Xử lý đăng xuất
router.get('/logout', authController.handleLogout);

// GET /auth/password/change - Hiển thị form đổi mật khẩu
router.get('/password/change', authController.getChangePasswordPage);

// POST /auth/password/change - Xử lý đổi mật khẩu
router.post('/password/change', authController.handleChangePassword);

// GET /auth/password/forgot - Hiển thị form quên mật khẩu
router.get('/password/forgot', authController.getForgotPasswordPage);

// POST /auth/password/forgot - Xử lý quên mật khẩu
router.post('/password/forgot', authController.handleForgotPassword);

// Legacy routes (giữ lại để tương thích)
router.get('/change-password', authController.getChangePasswordPage);
router.post('/change-password', authController.getChangePasswordPage);

module.exports = router;