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
route