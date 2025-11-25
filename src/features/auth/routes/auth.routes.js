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

// GET /auth/change-password - Vẫn giữ lại để tránh lỗi
router.get('/change-password', authController.getChangePasswordPage);

// POST /auth/change-password - Vẫn giữ lại để tránh lỗi
router.post('/change-password', authController.getChangePasswordPage);

// ĐÃ LOẠI BỎ: /forgot-password và /register

module.exports = router;