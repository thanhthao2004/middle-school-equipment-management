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
            if (value) {
                const inputDate = new Date(value);
                const today = new Date();
                // Set giờ về 00:00:00 để so sánh chỉ phần ngày
                inputDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                // Chỉ báo lỗi nếu ngày nhập > hôm nay (không bao gồm hôm nay)
                if (inputDate > today) {
                    throw new Error('Ngày nhập không thể là ngày trong tương lai');
                }
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
        .withMessage('Danh mục không hợp lệ'),
    body('lop')
        .optional()
        .custom(value => {
            if (Array.isArray(value)) {
                const validClasses = ['6', '7', '8', '9'];
                const invalid = value.find(l => !validClasses.includes(String(l)));
                if (invalid) {
                    throw new Error(`Lớp không hợp lệ: ${invalid}. Chỉ được chọn lớp 6, 7, 8, 9`);
                }
            } else if (value) {
                const validClasses = ['6', '7', '8', '9'];
                if (!validClasses.includes(String(value))) {
                    throw new Error(`Lớp không hợp lệ: ${value}. Chỉ được chọn lớp 6, 7, 8, 9`);
                }
            }
            return true;
        })
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
            if (value) {
                const inputDate = new Date(value);
                const today = new Date();
                // Set giờ về 00:00:00 để so sánh chỉ phần ngày
                inputDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                // Chỉ báo lỗi nếu ngày nhập > hôm nay (không bao gồm hôm nay)
                if (inputDate > today) {
                    throw new Error('Ngày nhập không thể là ngày trong tương lai');
                }
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
        .withMessage('Danh mục không hợp lệ'),
    body('lop')
        .optional()
        .custom(value => {
            if (Array.isArray(value)) {
                const validClasses = ['6', '7', '8', '9'];
                const invalid = value.find(l => !validClasses.includes(String(l)));
                if (invalid) {
                    throw new Error(`Lớp không hợp lệ: ${invalid}. Chỉ được chọn lớp 6, 7, 8, 9`);
                }
            } else if (value) {
                const validClasses = ['6', '7', '8', '9'];
                if (!validClasses.includes(String(value))) {
                    throw new Error(`Lớp không hợp lệ: ${value}. Chỉ được chọn lớp 6, 7, 8, 9`);
                }
            }
            return true;
        })
];

module.exports = {
    validateCreateDevice,
    validateUpdateDevice
};

