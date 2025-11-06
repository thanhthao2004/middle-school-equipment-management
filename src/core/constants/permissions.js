/**
 * Permissions constants
 */
const PERMISSIONS = {
	// Device management
	DEVICE_VIEW: 'device:view',
	DEVICE_CREATE: 'device:create',
	DEVICE_EDIT: 'device:edit',
	DEVICE_DELETE: 'device:delete',

	// Category management
	CATEGORY_VIEW: 'category:view',
	CATEGORY_CREATE: 'category:create',
	CATEGORY_EDIT: 'category:edit',
	CATEGORY_DELETE: 'category:delete',

	// Borrow management
	BORROW_VIEW: 'borrow:view',
	BORROW_CREATE: 'borrow:create',
	BORROW_APPROVE: 'borrow:approve',
	BORROW_CANCEL: 'borrow:cancel',

	// User management
	USER_VIEW: 'user:view',
	USER_CREATE: 'user:create',
	USER_EDIT: 'user:edit',
	USER_DELETE: 'user:delete',

	// Reports
	REPORT_VIEW: 'report:view',
	REPORT_CREATE: 'report:create',
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
	admin: Object.values(PERMISSIONS),
	giao_vien: [
		PERMISSIONS.DEVICE_VIEW,
		PERMISSIONS.BORROW_VIEW,
		PERMISSIONS.BORROW_CREATE,
		PERMISSIONS.BORROW_CANCEL,
	],
	to_truong: [
		PERMISSIONS.DEVICE_VIEW,
		PERMISSIONS.BORROW_VIEW,
		PERMISSIONS.BORROW_CREATE,
		PERMISSIONS.BORROW_APPROVE,
		PERMISSIONS.BORROW_CANCEL,
	],
	ql_thiet_bi: [
		PERMISSIONS.DEVICE_VIEW,
		PERMISSIONS.DEVICE_CREATE,
		PERMISSIONS.DEVICE_EDIT,
		PERMISSIONS.DEVICE_DELETE,
		PERMISSIONS.CATEGORY_VIEW,
		PERMISSIONS.CATEGORY_CREATE,
		PERMISSIONS.CATEGORY_EDIT,
		PERMISSIONS.CATEGORY_DELETE,
		PERMISSIONS.BORROW_VIEW,
		PERMISSIONS.BORROW_APPROVE,
		PERMISSIONS.REPORT_VIEW,
		PERMISSIONS.REPORT_CREATE,
	],
	hieu_truong: Object.values(PERMISSIONS),
};

const hasPermission = (role, permission) => {
	return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

module.exports = {
	PERMISSIONS,
	ROLE_PERMISSIONS,
	hasPermission,
};

