// Borrow Routes
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const { authenticate } = require('../../../core/middlewares/auth.middleware');
const { validate } = require('../../../core/middlewares/validation.middleware');
const borrowValidators = require('../validators/borrow.validators');

// Apply auth middleware to all routes
router.use(authenticate);
// GET Routes - Pages
router.get('/register', borrowController.getRegisterPage);
router.get('/history', borrowController.getHistoryPage);
router.get('/status', borrowController.getStatusPage);
router.get('/pending-approvals', borrowController.getPendingApprovalsPage);
router.get('/teacher-home', borrowController.getTeacherHomePage);
router.get('/slip/:id', borrowController.getBorrowSlip);

// POST Routes - Actions
router.post('/register', 
    validate(borrowValidators.createBorrowRequest),
    borrowController.createBorrowRequest
);
/**
 * Authentication middleware
 */

module.exports = router;
// KHÔNG require 'error-codes' và 'response' ở đây. 
// Chúng sẽ được require bên trong các hàm xử lý để tránh vòng lặp phụ thuộc.

// Placeholder - implement with your auth strategy (JWT, session, etc.)
const authenticate = async (req, res, next) => {
    // Tải module tại runtime (khi hàm được gọi)
    const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
    const { sendError } = require('../utils/response');
    
	try {
		// TODO: Implement authentication logic
		// Example: Check session, JWT token, etc.
		// const token = req.headers.authorization?.split(' ')[1];
		// const user = await verifyToken(token);
		// req.user = user;

        // MOCK AUTH: Gán user mock nếu chưa có để đảm bảo requireRole có thể kiểm tra
        if (!req.user) {
            req.user = { id: 1, role: 'ql_thiet_bi', name: 'Quản lý Mock' };
        }

		// For now, skip auth check
		next();
	} catch (error) {
		// Dùng sendError đã được require bên trong
		return sendError(res, getErrorMessage(ERROR_CODES.UNAUTHORIZED), 401);
	}
};

// Check if user has required role
const requireRole = (...allowedRoles) => {
	return (req, res, next) => {
        // Tải module tại runtime (khi hàm được gọi)
        const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
        const { sendError } = require('../utils/response');

		// TODO: Get user from req.user (set by authenticate middleware)
		const userRole = req.user?.role;
		
		// Logic kiểm tra vai trò
		if (!userRole || !allowedRoles.includes(userRole)) {
            console.warn(`Attempted access by user with role ${userRole} to restricted route.`);
            // Dùng sendError đã được require bên trong
		    return sendError(res, getErrorMessage(ERROR_CODES.FORBIDDEN), 403);
		}
		next();
	};
};

// Check if user has required permission
const requirePermission = (permission) => {
    // Tải module tại runtime (khi hàm được gọi)
    const { ERROR_CODES, getErrorMessage } = require('../constants/error-codes');
    const { sendError } = require('../utils/response');

	return (req, res, next) => {
		// TODO: Get user from req.user and check permission
		// const userRole = req.user?.role;
		// if (!hasPermission(userRole, permission)) {
        //     return sendError(res, getErrorMessage(ERROR_CODES.FORBIDDEN), 403);
		// }
		next();
	};
};

module.exports = {
	authenticate,
	requireRole,
	requirePermission,
};
