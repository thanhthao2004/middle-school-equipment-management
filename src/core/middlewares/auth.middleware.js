/**
 * Authentication middleware
 */

const jwt = require('jsonwebtoken'); 
const config = require('../../config/env'); 
const User = require('../../features/users/models/user.model');
const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
    try {
        // 1. Lấy token từ Cookie
        const token = req.cookies.jwt;

        // 2. Kiểm tra token tồn tại
        if (!token || token === 'loggedout') {
            const errorMessage = getErrorMessage(ERROR_CODES.UNAUTHORIZED);
            if (req.originalUrl.startsWith('/api') || req.xhr) {
                return sendError(res, errorMessage, 401);
            }
            return res.redirect(`/auth/login?error=${encodeURIComponent('Yêu cầu đăng nhập để truy cập')}`);
        }

        // 3. Giải mã (Verify) token
        const decoded = jwt.verify(token, config.jwt.secret);

        // 4. Tìm user dựa trên ID trong token (loại trừ trường mật khẩu)
        const user = await User.findById(decoded.id).select('-matKhauHash');

        if (!user) {
            return sendError(res, getErrorMessage(ERROR_CODES.UNAUTHORIZED), 401);
        }

        // 5. Gán user vào req.user và đi tiếp
        req.user = user;
        next();
    } catch (error) {
        // Xử lý lỗi JWT (Token không hợp lệ hoặc hết hạn)
        let errorMessage = getErrorMessage(ERROR_CODES.UNAUTHORIZED);
        if (error.name === 'JsonWebTokenError') {
            errorMessage = getErrorMessage(ERROR_CODES.AUTH_TOKEN_INVALID);
        } else if (error.name === 'TokenExpiredError') {
            errorMessage = getErrorMessage(ERROR_CODES.AUTH_TOKEN_EXPIRED);
        }
        
        // Xóa cookie lỗi
        res.cookie('jwt', 'error', { maxAge: 0, httpOnly: true });

        if (req.originalUrl.startsWith('/api') || req.xhr) {
            return sendError(res, errorMessage, 401);
        }
        return res.redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
    }
};

// Middleware kiểm tra role
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            const errorMessage = getErrorMessage(ERROR_CODES.FORBIDDEN);
            if (req.originalUrl.startsWith('/api') || req.xhr) {
                return sendError(res, errorMessage, 403);
            }
            // Render trang lỗi 403
            return res.status(403).render('borrow/views/error_page', { 
                status: 403, 
                message: 'Truy cập bị từ chối',
                errorDetail: 'Bạn không có quyền thực hiện chức năng này.'
            });
        }
        next();
    };
};

// Check if user has required permission (Giữ nguyên)
const requirePermission = (permission) => {
    return (req, res, next) => {
        next();
    };
};

module.exports = {
    authenticate,
    requireRole,
    requirePermission,
};