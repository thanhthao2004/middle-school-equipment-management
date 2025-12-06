/**
 * Validation middleware wrapper
 * Hỗ trợ cả Joi schema và express-validator array
 */
const { validationResult } = require('express-validator');
const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
const { sendError } = require('../utils/response');

const validate = (validators) => {
	// Nếu là array (express-validator), xử lý khác
	if (Array.isArray(validators)) {
		return async (req, res, next) => {
			// Chạy tất cả validators
			await Promise.all(validators.map(validator => validator.run(req)));

			// Kiểm tra kết quả
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const errorMessages = errors.array().map(err => err.msg);

				// Kiểm tra nếu là form submission (HTML) hay API request (JSON)
				const acceptsHtml = req.accepts('html');

				if (acceptsHtml) {
					// Form submission - redirect với flash message
					if (!req.session.flash) req.session.flash = {};
					req.session.flash.error = errorMessages.join(', ');
					req.session.flash.validationErrors = errorMessages;

					// LƯU LẠI DỮ LIỆU FORM để không mất khi redirect
					req.session.flash.formData = req.body;

					// Redirect về trang trước đó hoặc trang tạo mới
					const referer = req.get('referer') || '/manager/devices/create';
					return res.redirect(referer);
				} else {
					// API request - trả về JSON
					return sendError(res, getErrorMessage(ERROR_CODES.VALIDATION_ERROR), 400, errorMessages);
				}
			}

			next();
		};
	}

	// Nếu là Joi schema (backward compatibility)
	return (req, res, next) => {
		const { error } = validators.validate(req.body, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			const errors = error.details.map((detail) => detail.message);
			return sendError(res, getErrorMessage(ERROR_CODES.VALIDATION_ERROR), 400, errors);
		}

		next();
	};
};

const validateQuery = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.query, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			const errors = error.details.map((detail) => detail.message);
			return sendError(res, getErrorMessage(ERROR_CODES.VALIDATION_ERROR), 400, errors);
		}

		next();
	};
};

const validateParams = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.params, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			const errors = error.details.map((detail) => detail.message);
			return sendError(res, getErrorMessage(ERROR_CODES.VALIDATION_ERROR), 400, errors);
		}

		next();
	};
};

module.exports = {
	validate,
	validateQuery,
	validateParams,
};
