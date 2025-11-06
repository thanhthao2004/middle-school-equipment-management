/**
 * User roles constants
 */
const ROLES = {
	ADMIN: 'admin',
	GIAO_VIEN: 'giao_vien',
	TO_TRUONG: 'to_truong',
	QL_THIET_BI: 'ql_thiet_bi',
	HIEU_TRUONG: 'hieu_truong',
};

const ROLE_NAMES = {
	[ROLES.ADMIN]: 'Quản trị viên',
	[ROLES.GIAO_VIEN]: 'Giáo viên',
	[ROLES.TO_TRUONG]: 'Tổ trưởng',
	[ROLES.QL_THIET_BI]: 'Quản lý thiết bị',
	[ROLES.HIEU_TRUONG]: 'Hiệu trưởng',
};

const getAllRoles = () => Object.values(ROLES);

const getRoleName = (role) => ROLE_NAMES[role] || role;

module.exports = {
	ROLES,
	ROLE_NAMES,
	getAllRoles,
	getRoleName,
};

