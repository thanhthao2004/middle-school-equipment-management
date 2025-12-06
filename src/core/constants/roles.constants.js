/**
 * Role Constants
 * Defines user roles and their access permissions
 */

const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'ql_thiet_bi',
    TEACHER: 'giao_vien',
    DEPT_HEAD: 'to_truong',
    PRINCIPAL: 'hieu_truong',
};

// Route prefixes accessible by each role
const ROLE_ROUTES = {
    admin: ['/admin'],
    ql_thiet_bi: ['/manager'],
    giao_vien: ['/teacher/borrow'],
    to_truong: ['/teacher'], // Includes all teacher routes + additional
    hieu_truong: ['/principal'],
};

// Human-readable role names
const ROLE_NAMES = {
    admin: 'Quản trị viên',
    ql_thiet_bi: 'Quản lý thiết bị',
    giao_vien: 'Giáo viên',
    to_truong: 'Tổ trưởng chuyên môn',
    hieu_truong: 'Hiệu trưởng',
};

/**
 * Check if a role has access to a specific route
 * @param {String} role - User role
 * @param {String} path - Route path to check
 * @returns {Boolean} Whether role has access
 */
function hasRouteAccess(role, path) {
    const allowedPrefixes = ROLE_ROUTES[role] || [];

    // Check if path starts with any allowed prefix
    return allowedPrefixes.some(prefix => path.startsWith(prefix));
}

/**
 * Check if role is valid
 * @param {String} role - Role to validate
 * @returns {Boolean} Whether role exists
 */
function isValidRole(role) {
    return Object.values(ROLES).includes(role);
}

module.exports = {
    ROLES,
    ROLE_ROUTES,
    ROLE_NAMES,
    hasRouteAccess,
    isValidRole,
};
