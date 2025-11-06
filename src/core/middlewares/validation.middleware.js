/**
 * Validation middleware wrapper
 */
const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
const { sendError } = require('../utils/response');

const validate = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body, {
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

