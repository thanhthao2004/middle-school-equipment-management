const bcrypt = require('bcrypt');
const repo = require('../repositories/users.repo');

/**
 * Map form data sang MongoDB model schema
 * @param {Object} formData - Dữ liệu từ form
 * @returns {Object} Dữ liệu đã được map
 */
const mapFormDataToModel = (formData) => {
  // Tạo email từ username (nếu chưa có @ thì thêm domain)
  let email = formData.username.toLowerCase().trim();
  if (!email.includes('@')) {
    email = `${email}@school.edu.vn`;
  }

  // Map các field từ form sang model
  const userData = {
    hoTen: formData.fullname.trim(),
    email: email,
    soDienThoai: formData.phone?.trim() || '',
    diaChi: formData.address?.trim() || '',
    role: formData.role,
    matKhauHash: formData.passwordHash, // Đã được hash ở đây
    trangThai: 'active',
    chucVu: formData.role // Có thể lưu thêm thông tin khác vào đây nếu cần
  };

  // Lưu thêm thông tin bổ sung vào chucVu dạng JSON string (nếu cần)
  const additionalInfo = {
    experience: formData.experience,
    gender: formData.gender,
    subject: formData.subject,
    dob: formData.dob,
    specialization: formData.specialization
  };
  
  // Chỉ lưu các field có giá trị
  const hasAdditionalInfo = Object.values(additionalInfo).some(v => v);
  if (hasAdditionalInfo) {
    userData.chucVu = JSON.stringify({
      role: formData.role,
      ...additionalInfo
    });
  }

  return userData;
};

/**
 * Tạo user mới
 * @param {Object} formData - Dữ liệu từ form
 * @returns {Promise<Object>} User đã tạo
 */
exports.createUser = async (formData) => {
  // Kiểm tra username đã tồn tại chưa
  const exists = await repo.findByUsername(formData.username);
  if (exists) {
    throw new Error('Tên người dùng đã tồn tại!');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(formData.password, saltRounds);

  // Map form data và thêm password hash
  const userData = mapFormDataToModel({
    ...formData,
    passwordHash
  });

  // Tạo user trong MongoDB
  const user = await repo.create(userData);
  return user;
};

/**
 * Map MongoDB user data sang format cho view
 * @param {Object} user - User từ MongoDB
 * @returns {Object} User đã được map
 */
const mapUserToView = (user) => {
  // Parse thông tin bổ sung từ chucVu nếu có
  let additionalInfo = {};
  try {
    if (user.chucVu && user.chucVu.startsWith('{')) {
      additionalInfo = JSON.parse(user.chucVu);
    }
  } catch (e) {
    // Nếu không parse được thì bỏ qua
  }

  return {
    id: user._id.toString(),
    fullname: user.hoTen,
    username: user.email.split('@')[0], // Lấy phần trước @ làm username
    email: user.email,
    phone: user.soDienThoai,
    address: user.diaChi,
    role: user.role,
    experience: additionalInfo.experience || '',
    gender: additionalInfo.gender || '',
    subject: additionalInfo.subject || '',
    dob: additionalInfo.dob || '',
    specialization: additionalInfo.specialization || '',
    maNV: user.maNV,
    trangThai: user.trangThai,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Lấy tất cả users hoặc tìm kiếm
 * @param {String} query - Từ khóa tìm kiếm (optional)
 * @returns {Promise<Array>} Danh sách users đã được map
 */
exports.getAllUsers = async (query) => {
  let users;
  if (query && query.trim()) {
    users = await repo.searchByQuery(query.trim());
  } else {
    users = await repo.getAll();
  }
  return users.map(mapUserToView);
};

/**
 * Lấy user theo ID
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} User đã được map
 */
exports.getById = async (id) => {
  const user = await repo.findById(id);
  if (!user) return null;
  return mapUserToView(user);
};

/**
 * Cập nhật user
 * @param {String} id - MongoDB ObjectId
 * @param {Object} formData - Dữ liệu từ form
 * @returns {Promise<Object>} User đã cập nhật
 */
exports.updateUser = async (id, formData) => {
  // Kiểm tra user có tồn tại không
  const existingUser = await repo.findById(id);
  if (!existingUser) {
    throw new Error('Không tìm thấy người dùng!');
  }

  // Nếu có username mới, kiểm tra trùng
  if (formData.username && formData.username !== existingUser.email.split('@')[0]) {
    const exists = await repo.findByUsername(formData.username);
    if (exists && exists._id.toString() !== id) {
      throw new Error('Tên người dùng đã tồn tại!');
    }
  }

  // Map form data sang model schema
  const updateData = {};
  
  if (formData.fullname) {
    updateData.hoTen = formData.fullname.trim();
  }
  
  if (formData.phone) {
    updateData.soDienThoai = formData.phone.trim();
  }
  
  if (formData.address !== undefined) {
    updateData.diaChi = formData.address.trim();
  }
  
  if (formData.username) {
    let email = formData.username.toLowerCase().trim();
    if (!email.includes('@')) {
      email = `${email}@school.edu.vn`;
    }
    updateData.email = email;
  }
  
  if (formData.role) {
    updateData.role = formData.role;
  }

  // Nếu có password mới, hash nó
  if (formData.password && formData.password.trim()) {
    const saltRounds = 10;
    updateData.matKhauHash = await bcrypt.hash(formData.password, saltRounds);
  }

  // Lưu thông tin bổ sung vào chucVu
  const additionalInfo = {
    experience: formData.experience,
    gender: formData.gender,
    subject: formData.subject,
    dob: formData.dob,
    specialization: formData.specialization
  };
  
  const hasAdditionalInfo = Object.values(additionalInfo).some(v => v);
  if (hasAdditionalInfo) {
    updateData.chucVu = JSON.stringify({
      role: formData.role || existingUser.role,
      ...additionalInfo
    });
  }

  // Cập nhật user
  const updatedUser = await repo.update(id, updateData);
  if (!updatedUser) {
    throw new Error('Không thể cập nhật người dùng!');
  }
  
  return mapUserToView(updatedUser);
};

/**
 * Xóa user
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Boolean>} true nếu xóa thành công
 */
exports.deleteUser = async (id) => {
  const user = await repo.findById(id);
  if (!user) {
    throw new Error('Không tìm thấy người dùng!');
  }
  
  // Không cho phép xóa chính mình (nếu có req.user)
  // Có thể thêm logic kiểm tra khác ở đây
  
  const result = await repo.remove(id);
  return result;
};

/**
 * Kiểm tra có principal (admin) nào tồn tại không
 * @returns {Promise<Boolean>} true nếu có principal
 */
exports.checkAdminExists = async () => {
  const principal = await repo.findByRole('hieu_truong');
  return principal ? true : false;
};
