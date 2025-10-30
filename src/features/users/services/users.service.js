const repo = require('../repositories/users.repo');

exports.createUser = async (data) => {
  // Chỉ duy nhất kiểm tra nghiệp vụ, không validate field ở đây nữa!
  const exists = await repo.findByUsername(data.username);
  if (exists) throw new Error('Tên người dùng đã tồn tại!');
  return repo.create(data);
};

exports.getAllUsers = async () => {
  return await repo.getAll();
};
