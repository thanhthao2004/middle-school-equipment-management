/**
 * Error Handling Middleware
 * Xử lý lỗi tập trung cho toàn bộ ứng dụng
 */

const logger = require('../../config/logger');

/**
 * Middleware xử lý route không tìm thấy (404)
 * Phải đặt sau tất cả routes
 */
function notFoundHandler(req, res) {
    res.status(404).render('errors/404', {
        title: '404 - Không tìm thấy trang',
        message: 'Trang bạn đang tìm kiếm không tồn tại.',
        user: req.user || null
    });
}

/**
 * Middleware xử lý lỗi (500)
 * Phải đặt cuối cùng, sau tất cả middleware khác
 */
function errorHandler(err, req, res, next) {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).render('errors/500', {
            title: 'Lỗi xác thực dữ liệu',
            message: 'Dữ liệu không hợp lệ',
            errors: errors,
            user: req.user || null
        });
    }

    // Mongoose duplicate key error (11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).render('errors/500', {
            title: 'Lỗi trùng lặp dữ liệu',
            message: `${field} đã tồn tại trong hệ thống`,
            user: req.user || null
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).render('errors/500', {
            title: 'Lỗi định dạng dữ liệu',
            message: 'ID không hợp lệ',
            user: req.user || null
        });
    }

    // Custom error with statusCode
    if (err.statusCode) {
        return res.status(err.statusCode).render('errors/500', {
            title: 'Lỗi',
            message: err.message || 'Đã xảy ra lỗi',
            user: req.user || null
        });
    }

    // Default: 500 Internal Server Error
    res.status(500).render('errors/500', {
        title: 'Lỗi máy chủ',
        message: process.env.NODE_ENV === 'production' 
            ? 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
            : err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        user: req.user || null
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};

