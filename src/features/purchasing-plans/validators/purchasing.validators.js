const { body } = require('express-validator');

// Chuyển giá tiền "1.200.000" thành số 1200000
const moneySanitizer = (value) => {
	if (value === undefined || value === null) return value;
	const normalized = String(value).replace(/\./g, '').trim();
	if (normalized === '') return undefined;
	return Number(normalized);
};

const validateCreatePlan = [
	body('code')
		.optional()
		.trim()
		.matches(/^KH\d{3,}$/)
		.withMessage('Mã kế hoạch phải theo mẫu KH001'),

	body('date')
		.optional()
		.isISO8601()
		.withMessage('Ngày lập không hợp lệ'),

	body('items')
		.isArray({ min: 1 })
		.withMessage('Cần ít nhất một thiết bị'),

	body('items.*.code')
		.trim()
		.notEmpty()
		.withMessage('Mã thiết bị là bắt buộc'),

	body('items.*.name')
		.trim()
		.notEmpty()
		.withMessage('Tên thiết bị là bắt buộc'),

	body('items.*.quantity')
		.isInt({ min: 1 })
		.withMessage('Số lượng phải >= 1')
		.toInt(),

	body('items.*.uom')
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage('Đơn vị tính không được quá 50 ký tự'),

	body('items.*.unitPrice')
		.optional()
		.customSanitizer(moneySanitizer)
		.isInt({ min: 0 })
		.withMessage('Đơn giá không hợp lệ'),

	body('items.*.budget')
		.optional()
		.customSanitizer(moneySanitizer)
		.isInt({ min: 0 })
		.withMessage('Dự toán kinh phí không hợp lệ'),

	body('items.*.expectedAt')
		.optional()
		.isISO8601()
		.withMessage('Thời gian dự kiến mua không hợp lệ'),

	body('items.*.reason')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Lý do không được quá 500 ký tự'),

	body('items.*.source')
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage('Nguồn gốc không được quá 100 ký tự')
];

module.exports = {
	validateCreatePlan
};
