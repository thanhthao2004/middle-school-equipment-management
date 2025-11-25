const { body } = require('express-validator');

const validateCreateDevice = [
    body('tenTB')
        .trim()
        .notEmpty()
        .withMessage('Tên thiết bị không được để trống'),
    body('maTB')
        .optional()
        .trim(),
    body('soLuong')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Số lượng phải là số nguyên dương'),
    body('ngayNhap')
        .optional()
        .isISO8601()
        .withMessage('Ngày nhập không hợp lệ'),
    body('category')
        .optional()
        .isMongoId()
        .withMessage('Danh mục không hợp lệ')
];

const validateUpdateDevice = [
    body('tenTB')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Tên thiết bị không được để trống'),
    body('soLuong')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Số lượng phải là số nguyên dương'),
    body('ngayNhap')
        .optional()
        .isISO8601()
        .withMessage('Ngày nhập không hợp lệ'),
    body('category')
        .optional()
        .isMongoId()
        .withMessage('Danh mục không hợp lệ')
];

module.exports = {
    validateCreateDevice,
    validateUpdateDevice
};

