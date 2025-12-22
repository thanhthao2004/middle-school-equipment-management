const User = require('../models/user.model');

const create = async (data) => {
  const user = new User(data);
  await user.save();
  return user;
};

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findByUsername = async (username) => {
  return await User.findOne({ username });
};

const getAll = async (query = {}) => {
  return await User.find(query).sort({ createdAt: -1 });
};

const findById = async (id) => {
  return await User.findById(id);
};

const update = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

const _delete = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  getAll,
  findById,
  update,
  delete: _delete
};