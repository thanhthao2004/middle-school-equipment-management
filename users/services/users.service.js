const repo = require('../repositories/users.repo');

// Helper: validate phone number (must start with 0 and have 10 digits)
const validatePhone = (phone) => {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

// Helper: capitalize first letter of each word
const capitalizeFullname = (fullname) => {
  if (!fullname) return fullname;
  return fullname
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

exports.createUser = async (data) => {
  // Map Vietnamese/display role values to internal enum codes
  const roleMap = {
    'Hiệu trưởng': 'principal',
    'Hiệu Trưởng': 'principal',
    'Giáo viên': 'teacher',
    'Giáo Viên': 'teacher',
    'Nhân viên': 'staff',
    'Nhân Viên': 'staff',
    'principal': 'principal',
    'teacher': 'teacher',
    'staff': 'staff',
    'user': 'user'
  };

  const payload = { ...data };
  
  // Validate phone number
  if (!payload.phone || !validatePhone(payload.phone)) {
    throw new Error('Số điện thoại phải bắt đầu với 0 và có 10 chữ số!');
  }
  
  // Capitalize fullname
  if (payload.fullname) {
    payload.fullname = capitalizeFullname(payload.fullname);
  }
  
  if (payload.role) payload.role = roleMap[payload.role] || payload.role;

  const exists = await repo.findByUsername(payload.username);
  if (exists) throw new Error('Tên người dùng đã tồn tại!');
  
  // Kiểm tra nếu role = 'principal' thì chỉ được phép có 1 principal trong hệ thống
  if (payload.role === 'principal') {
    const existingPrincipal = await repo.findByRole('principal');
    if (existingPrincipal) throw new Error('Hệ thống chỉ cho phép 1 Hiệu trưởng!');
  }
  
  return repo.create(payload);
};

exports.getAllUsers = async (q) => {
  if (q) return await repo.searchByQuery(q);
  return await repo.getAll();
};

exports.getById = async (id) => {
  return await repo.findById(id);
};

exports.updateUser = async (id, data) => {
  // nếu password rỗng thì không cập nhật
  if (!data.password) delete data.password;
  // Map display role to internal code before update
  const roleMap = {
    'Hiệu trưởng': 'principal',
    'Hiệu Trưởng': 'principal',
    'Giáo viên': 'teacher',
    'Giáo Viên': 'teacher',
    'Nhân viên': 'staff',
    'Nhân Viên': 'staff',
    'principal': 'principal',
    'teacher': 'teacher',
    'staff': 'staff',
    'user': 'user'
  };
  const payload = { ...data };
  
  // Validate phone number if provided
  if (payload.phone && !validatePhone(payload.phone)) {
    throw new Error('Số điện thoại phải bắt đầu với 0 và có 10 chữ số!');
  }
  
  // Capitalize fullname if provided
  if (payload.fullname) {
    payload.fullname = capitalizeFullname(payload.fullname);
  }
  
  if (payload.role) payload.role = roleMap[payload.role] || payload.role;

  // Nếu role được thay đổi thành 'principal', kiểm tra xem đã có principal khác chưa
  const currentUser = await repo.findById(id);
  if (!currentUser) throw new Error('Không tìm thấy người dùng');
  if (payload.role === 'principal' && currentUser.role !== 'principal') {
    const existingPrincipal = await repo.findByRole('principal');
    // Nếu tồn tại principal khác và khác user hiện tại -> không cho phép
    if (existingPrincipal && existingPrincipal._id.toString() !== currentUser._id.toString()) {
      throw new Error('Hệ thống chỉ cho phép 1 Hiệu trưởng!');
    }
  }

  const updated = await repo.update(id, payload);
  if (!updated) throw new Error('Không tìm thấy người dùng');
  return updated;
};

exports.deleteUser = async (id) => {
  const ok = await repo.remove(id);
  if (!ok) throw new Error('Không tìm thấy người dùng');
  return ok;
};

exports.checkAdminExists = async () => {
  const principal = await repo.findByRole('principal');
  return principal ? true : false;
};
