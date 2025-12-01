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

const getAll = async () => {
  return await User.find().sort({ createdAt: -1 });
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  getAll
};