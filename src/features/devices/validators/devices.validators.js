const { body } = require('express-validator');

const validateCreateDevice = [
    body('tenTB')
        .trim()
        .notEmpty()
        .withMessage('Tên thiết bị không được để trống')
        .isLength({ min: 3, max: 200 })
        .withMessage('Tên thiết bị phải từ 3-200 ký tự'),
    body('maTB')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Mã thiết bị không được quá 50 ký tự'),
    body('soLuong')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Số lượng phải là số nguyên dương (≥ 0)')
        .toInt(),
    body('tinhTrangThietBi')
        .optional()
        .trim()
        .isIn(['Tốt', 'Khá', 'Trung bình', 'Hỏng', ''])
        .withMessage('Trạng thái thiết bị không hợp lệ'),
    body('viTriLuuTru')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Vị trí lưu trữ không được quá 100 ký tự'),
    body('nguonGoc')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Nguồn gốc không được quá 100 ký tự'),
    body('ngayNhap')
        .optional()
        .isISO8601()
        .withMessage('Ngày nhập không hợp lệ')
        .custom(value => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Ngày nhập không thể là ngày trong tương lai');
            }
            return true;
        }),
    body('huongDanSuDung')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Hướng dẫn sử dụng không được quá 2000 ký tự'),
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
        .withMessage('Tên thiết bị không được để trống')
        .isLength({ min: 3, max: 200 })
        .withMessage('Tên thiết bị phải từ 3-200 ký tự'),
    body('maTB')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Mã thiết bị không được quá 50 ký tự'),
    body('soLuong')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Số lượng phải là số nguyên dương (≥ 0)')
        .toInt(),
    body('tinhTrangThietBi')
        .optional()
        .trim()
        .isIn(['Tốt', 'Khá', 'Trung bình', 'Hỏng', ''])
        .withMessage('Trạng thái thiết bị không hợp lệ'),
    body('viTriLuuTru')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Vị trí lưu trữ không được quá 100 ký tự'),
    body('nguonGoc')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Nguồn gốc không được quá 100 ký tự'),
    body('ngayNhap')
        .optional()
        .isISO8601()
        .withMessage('Ngày nhập không hợp lệ')
        .custom(value => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Ngày nhập không thể là ngày trong tương lai');
            }
            return true;
        }),
    body('huongDanSuDung')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Hướng dẫn sử dụng không được quá 2000 ký tự'),
    body('category')
        .optional()
        .isMongoId()
        .withMessage('Danh mục không hợp lệ')
];

module.exports = {
    validateCreateDevice,
    validateUpdateDevice
};

