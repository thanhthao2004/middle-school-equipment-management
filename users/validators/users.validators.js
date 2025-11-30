const { body } = require('express-validator');

const validateCreateUser = [
  body('fullname')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập họ và tên.'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập số điện thoại.'),
  body('address')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập địa chỉ.'),
  body('username')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập tên người dùng.')
    .isLength({ min: 3 }).withMessage('Tên người dùng tối thiểu 3 ký tự.'),
  body('password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu.')
    .isLength({ min: 6, max: 32 }).withMessage('Mật khẩu phải từ 6-32 ký tự.'),
  body('role')
    .notEmpty().withMessage('Vui lòng chọn chức vụ.'),
  body('experience')
    .notEmpty().withMessage('Vui lòng chọn số năm kinh nghiệm.'),
  body('specialization')
    .trim(), // không required
  body('gender')
    .notEmpty().withMessage('Vui lòng chọn giới tính.'),
  body('subject')
    .trim(), // không required
  body('dob')
    .notEmpty().withMessage('Vui lòng chọn ngày sinh.')
];

module.exports = {
  validateCreateUser
};
