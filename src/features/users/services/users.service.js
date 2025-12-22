const repo = require('../repositories/users.repo');
const bcrypt = require('bcrypt');

exports.createUser = async (data) => {
  // Tự động tạo email từ username
  const autoEmail = `${data.username}@iuh.edu.vn`;

  // Kiểm tra username đã tồn tại chưa
  const existingUser = await repo.findByUsername(data.username);
  if (existingUser) {
    throw new Error('Tên đăng nhập đã tồn tại!');
  }

  // Hash mật khẩu
  const saltRounds = 10;
  const matKhauHash = await bcrypt.hash(data.password, saltRounds);

  // Map dữ liệu từ form sang schema User
  const userData = {
    hoTen: data.fullname,
    username: data.username, // Lưu username
    email: autoEmail, // Tự động tạo email từ username
    soDienThoai: data.phone,
    diaChi: data.address,
    chucVu: data.experience, // Lưu thông tin kinh nghiệm vào chucVu
    role: data.role,
    matKhauHash: matKhauHash,
    trangThai: 'active',
    // Map new fields
    ngaySinh: data.dob,
    gioiTinh: data.gender,
    boMon: data.subject,
    trinhDo: data.specialization
  };

  return await repo.create(userData);
};

exports.getAllUsers = async (queryStr) => {
  const filter = {};
  if (queryStr) {
    const regex = new RegExp(queryStr, 'i');
    filter.$or = [
      { hoTen: regex },
      { username: regex },
      { maNV: regex },
      { email: regex }
    ];
  }
  return await repo.getAll(filter);
};

exports.getUserById = async (id) => {
  return await repo.findById(id);
};

exports.updateUser = async (id, data) => {
  const updateData = {
    hoTen: data.fullname,
    // username: data.username, // Username usually shouldn't be changed
    // email: data.email, // Email usually linked to username
    soDienThoai: data.phone,
    diaChi: data.address,
    chucVu: data.experience,
    role: data.role,
    trangThai: data.status,
    ngaySinh: data.dob,
    gioiTinh: data.gender,
    boMon: data.subject,
    trinhDo: data.specialization
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  return await repo.update(id, updateData);
};

exports.deleteUser = async (id) => {
  return await repo.delete(id);
};
