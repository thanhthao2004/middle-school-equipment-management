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
				return sendError(res, getErrorMessage(ERROR_CODES.VALIDATION_ERROR), 400, errorMessages);
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
