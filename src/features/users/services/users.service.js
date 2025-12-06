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
    trangThai: 'active'
  };

  return await repo.create(userData);
};

exports.getAllUsers = async () => {
  return await repo.getAll();
};
