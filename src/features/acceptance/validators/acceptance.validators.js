// src/features/acceptance/validators/acceptance.validators.js

// Import cần thiết
const { body, param, query } = require('express-validator');

const createAcceptanceMinute = [
    // Ví dụ về validation cho việc tạo mới
    // body('maBienBan').trim().isLength({ min: 5, max: 10 }).withMessage('Mã biên bản không hợp lệ'),
    // body('tenBienBan').trim().isLength({ min: 10 }).withMessage('Tên biên bản phải có ít nhất 10 ký tự'),
];

module.exports = {
    createAcceptanceMinute,
};