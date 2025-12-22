/**
 * Authentication Middleware
 * JWT-based authentication and role-based authorization
 */

const authService = require('../../features/auth/services/auth.service');
const { hasRouteAccess, isValidRole } = require('../constants/roles.constants');

/**
 * Authenticate user via JWT cookie
 * Populates req.user with user data if authenticated
 */
const authenticate = async (req, res, next) => {
	try {
		// Extract JWT from cookie
		const token = req.cookies?.token;

		if (!token) {
			// No token - redirect to login for HTML pages, error for APIs
			return handleUnauthenticated(req, res);
		}

		// Verify and decode JWT
		const decoded = authService.verifyToken(token);

		// Check if user is still active in DB
		const User = require('../../features/users/models/user.model');
		const user = await User.findById(decoded.id).select('trangThai');

		if (!user || user.trangThai !== 'active') {
			res.clearCookie('token');
			const errorMsg = !user ? 'Tài khoản không tồn tại' : 'Tài khoản đã bị khóa';
			const isApiRequest = req.get('Content-Type')?.includes('application/json') || req.path.includes('/api/');
			if (isApiRequest) {
				return res.status(401).json({ success: false, message: errorMsg });
			}
			return res.redirect(`/auth/login?error=${encodeURIComponent(errorMsg)}`);
		}

		// Attach user data to request
		req.user = {
			id: decoded.id,
			username: decoded.username,
			role: decoded.role,
			hoTen: decoded.hoTen,
		};

		next();

	} catch (error) {
		console.error('Authentication error:', error.message);

		// Clear invalid token
		res.clearCookie('token');

		return handleUnauthenticated(req, res);
	}
};

/**
 * Optional authentication
 * Populates req.user if token exists, but doesn't block request
 */
const authenticateOptional = async (req, res, next) => {
	try {
		const token = req.cookies?.token;

		if (token) {
			const decoded = authService.verifyToken(token);
			req.user = {
				id: decoded.id,
				username: decoded.username,
				role: decoded.role,
				hoTen: decoded.hoTen,
			};
		}
	} catch (error) {
		// Ignore errors for optional auth
		console.warn('Optional auth failed:', error.message);
	}

	next();
};

/**
 * Require specific role(s) to access route
 * @param {...String} allowedRoles - List of allowed roles
 * @returns {Function} Middleware function
 */
const requireRole = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) {
			return handleUnauthenticated(req, res);
		}

		const userRole = req.user.role;

		if (!allowedRoles.includes(userRole)) {
			return handleForbidden(req, res, userRole, allowedRoles);
		}

		next();
	};
};

/**
 * Require permission to access route
 * @param {String} permission - Required permission
 * @returns {Function} Middleware function
 */
const requirePermission = (permission) => {
	return (req, res, next) => {
		if (!req.user) {
			return handleUnauthenticated(req, res);
		}

		// Check if user's role has access to current route
		const currentPath = req.path;
		const userRole = req.user.role;

		if (!hasRouteAccess(userRole, currentPath)) {
			return handleForbidden(req, res, userRole, [permission]);
		}

		next();
	};
};

/**
 * Handle unauthenticated requests
 * @private
 */
function handleUnauthenticated(req, res) {
	const isApiRequest = req.get('Content-Type')?.includes('application/json') || req.path.includes('/api/');

	if (isApiRequest) {
		return res.status(401).json({
			success: false,
			message: 'Vui lòng đăng nhập để tiếp tục',
			error: 'Unauthorized'
		});
	} else {
		// Redirect to login page
		const redirectUrl = encodeURIComponent(req.originalUrl);
		return res.redirect(`/auth/login?redirect=${redirectUrl}`);
	}
}

/**
 * Handle forbidden requests (authenticated but insufficient permissions)
 * @private
 */
function handleForbidden(req, res, userRole, requiredRoles) {
	const isApiRequest = req.get('Content-Type')?.includes('application/json') || req.path.includes('/api/');

	if (isApiRequest) {
		return res.status(403).json({
			success: false,
			message: 'Bạn không có quyền truy cập tài nguyên này',
			error: 'Forbidden'
		});
	} else {
		// Render forbidden page
		const { ROLE_NAMES } = require('../constants/roles.constants');
		const userRoleName = ROLE_NAMES[userRole] || userRole;
		const requiredRolesNames = Array.isArray(requiredRoles)
			? requiredRoles.map(r => ROLE_NAMES[r] || r).join(', ')
			: (ROLE_NAMES[requiredRoles] || requiredRoles);

		// Determine home page based on user role
		let homeUrl = '/';
		if (userRole === 'admin') {
			homeUrl = '/admin';
		} else if (userRole === 'ql_thiet_bi') {
			homeUrl = '/manager';
		} else if (userRole === 'hieu_truong') {
			homeUrl = '/principal';
		} else if (userRole === 'giao_vien' || userRole === 'to_truong') {
			homeUrl = '/teacher/borrow/teacher-home';
		}

		return res.status(403).render('errors/403', {
			title: 'Không có quyền truy cập',
			message: `Bạn không có quyền truy cập vào trang này.`,
			userRole: userRoleName,
			userRoleCode: userRole, // Pass role code for logic
			requiredRoles: requiredRoles,
			homeUrl: homeUrl
		});
	}
}

module.exports = {
	authenticate,
	authenticateOptional,
	requireRole,
	requirePermission,
};