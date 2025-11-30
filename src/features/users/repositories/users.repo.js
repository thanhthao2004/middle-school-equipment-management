const mongoose = require('mongoose');
const User = require('../models/user.model');
const { connectMongo } = require('../../../config/db');
const logger = require('../../../config/logger');

/**
 * Đảm bảo MongoDB connection đã sẵn sàng
 */
const ensureConnection = async () => {
  // Kiểm tra connection state
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 0) {
    logger.warn('MongoDB chưa kết nối, đang thử kết nối...');
    try {
      await connectMongo();
    } catch (error) {
      logger.error('Failed to connect MongoDB:', error.message);
      throw new Error('Không thể kết nối MongoDB. Vui lòng kiểm tra MongoDB có đang chạy không.');
    }
  }
  
  // Đợi một chút nếu đang trong quá trình kết nối
  if (mongoose.connection.readyState === 2) {
    // Đang connecting, đợi tối đa 5 giây
    let attempts = 0;
    while (mongoose.connection.readyState === 2 && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }
  
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB chưa sẵn sàng. Vui lòng kiểm tra kết nối database.');
  }
};

/**
 * Tạo user mới trong MongoDB
 * @param {Object} userData - Dữ liệu user đã được map và hash password
 * @returns {Promise<Object>} User đã tạo
 */
const create = async (userData) => {
  try {
    await ensureConnection();
    const user = new User(userData);
    await user.save();
    logger.info(`User created successfully: ${user.email} (${user.maNV})`);
    return user;
  } catch (error) {
    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        throw new Error('Email đã tồn tại trong hệ thống!');
      } else if (field === 'maNV') {
        throw new Error('Mã nhân viên đã tồn tại!');
      } else {
        // Xử lý các field khác (như id, username - không nên có trong schema)
        logger.warn(`Duplicate key error on unexpected field: ${field}`);
        throw new Error(`Dữ liệu đã tồn tại cho trường ${field}. Vui lòng thử lại.`);
      }
    }
    logger.error('Error creating user:', error.message);
    throw error;
  }
};

/**
 * Tìm user theo username (email)
 * @param {String} username - Username hoặc email
 * @returns {Promise<Object|null>} User nếu tìm thấy
 */
const findByUsername = async (username) => {
  try {
    await ensureConnection();
    // Tìm theo email (username được dùng làm email)
    const user = await User.findOne({ 
      $or: [
        { email: username.toLowerCase() },
        { email: `${username.toLowerCase()}@school.edu.vn` }
      ]
    });
    return user;
  } catch (error) {
    logger.error('Error finding user by username:', error.message);
    throw error;
  }
};

/**
 * Lấy tất cả users từ MongoDB
 * @returns {Promise<Array>} Danh sách users
 */
const getAll = async () => {
  try {
    await ensureConnection();
    const users = await User.find({}).sort({ createdAt: -1 });
    return users;
  } catch (error) {
    logger.error('Error getting all users:', error.message);
    throw error;
  }
};

/**
 * Tìm user theo ID
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object|null>} User nếu tìm thấy
 */
const findById = async (id) => {
  try {
    await ensureConnection();
    
    // Kiểm tra ID có hợp lệ không
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`Invalid user ID: ${id}`);
      return null;
    }
    
    const user = await User.findById(id);
    if (!user) {
      logger.warn(`User not found with ID: ${id}`);
    } else {
      logger.info(`User found: ${user.email} (${user.maNV})`);
    }
    return user;
  } catch (error) {
    logger.error('Error finding user by ID:', error.message);
    throw error;
  }
};

/**
 * Tìm kiếm users theo query string
 * @param {String} query - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách users
 */
const searchByQuery = async (query) => {
  try {
    await ensureConnection();
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive
    const users = await User.find({
      $or: [
        { hoTen: searchRegex },
        { email: searchRegex },
        { soDienThoai: searchRegex },
        { maNV: searchRegex },
        { role: searchRegex }
      ]
    }).sort({ createdAt: -1 });
    return users;
  } catch (error) {
    logger.error('Error searching users:', error.message);
    throw error;
  }
};

/**
 * Cập nhật user
 * @param {String} id - MongoDB ObjectId
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object|null>} User đã cập nhật
 */
const update = async (id, updateData) => {
  try {
    await ensureConnection();
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (user) {
      logger.info(`User updated successfully: ${user.email} (${user.maNV})`);
    }
    return user;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        throw new Error('Email đã tồn tại trong hệ thống!');
      } else if (field === 'maNV') {
        throw new Error('Mã nhân viên đã tồn tại!');
      }
    }
    logger.error('Error updating user:', error.message);
    throw error;
  }
};

/**
 * Xóa user
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Boolean>} true nếu xóa thành công
 */
const remove = async (id) => {
  try {
    await ensureConnection();
    const result = await User.findByIdAndDelete(id);
    if (result) {
      logger.info(`User deleted successfully: ${result.email} (${result.maNV})`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting user:', error.message);
    throw error;
  }
};

/**
 * Tìm user theo role
 * @param {String} role - Role cần tìm
 * @returns {Promise<Object|null>} User nếu tìm thấy
 */
const findByRole = async (role) => {
  try {
    await ensureConnection();
    const user = await User.findOne({ role });
    return user;
  } catch (error) {
    logger.error('Error finding user by role:', error.message);
    throw error;
  }
};

module.exports = {
  create,
  findByUsername,
  getAll,
  findById,
  searchByQuery,
  update,
  remove,
  findByRole
};