/**
 * Error handling middleware
 */
const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
	// eslint-disable-line no-unused-vars
	console.error('Error:', err);

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const errors = Object.values(err.errors).map((e) => e.message);
		return sendError(res, getErrorMessage(ERROR_CODES.VALIDATION_ERROR), 400, errors);
	}

	// Mongoose duplicate key error
	if (err.code === 11000) {
		const field = Object.keys(err.keyPattern)[0];
		return sendError(res, `${field} đã tồn tại`, 400);
	}

	// Mongoose cast error (invalid ObjectId, etc.)
	if (err.name === 'CastError') {
		return sendError(res, getErrorMessage(ERROR_CODES.NOT_FOUND), 404);
	}

	// Custom error with status code
	if (err.statusCode) {
		return sendError(res, err.message || getErrorMessage(ERROR_CODES.INTERNAL_ERROR), err.statusCode);
	}

	// Default error
	return sendError(res, err.message || getErrorMessage(ERROR_CODES.INTERNAL_ERROR), 500);
};

const notFoundHandler = (req, res) => {
	sendError(res, getErrorMessage(ERROR_CODES.NOT_FOUND), 404);
};

module.exports = {
	errorHandler,
	notFoundHandler,
};

