/**
 * Standardized response utilities
 */
const sendSuccess = (res, data = null, message = 'Thành công', statusCode = 200) => {
	res.status(statusCode).json({
		success: true,
		message,
		data,
	});
};

const sendError = (res, message = 'Có lỗi xảy ra', statusCode = 400, errors = null) => {
	res.status(statusCode).json({
		success: false,
		message,
		errors,
	});
};

const sendPaginated = (res, data, pagination, message = 'Thành công') => {
	res.json({
		success: true,
		message,
		data,
		pagination,
	});
};

module.exports = {
	sendSuccess,
	sendError,
	sendPaginated,
};

