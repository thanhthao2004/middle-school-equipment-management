// Profile Validators - Validation schemas cho profile
const { body } = require('express-validator');

const updateProfile = [
    body('hoTen')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Họ tên phải từ 2 đến 100 ký tự'),
    
    body('soDienThoai')
        .optional()
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),
    
    body('diaChi')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Địa chỉ không được vượt quá 255 ký tự'),
    
    body('ngaySinh')
        .optional()
        .isISO8601()
        .withMessage('Ngày sinh không hợp lệ'),
    
    body('gioiTinh')
        .optional()
        .isIn(['Nam', 'Nữ', 'Khác'])
        .withMessage('Giới tính không hợp lệ')
];

const changePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại là bắt buộc'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu mới phải chứa chữ hoa, chữ thường và số'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        })
];

module.exports = {
    updateProfile,
    changePassword
};

