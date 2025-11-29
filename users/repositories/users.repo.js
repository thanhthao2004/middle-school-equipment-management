const mongoose = require('mongoose');
const User = require("../models/user.model");

function generateUniqueId() {
  const letters = String.fromCharCode(65 + Math.floor(Math.random()*26)) +
                  String.fromCharCode(65 + Math.floor(Math.random()*26));
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${letters}${digits}`; // VD: AB0421
}

module.exports = {
  create: async (data) => {
    try {
      const user = new User({
        ...data,
        id: generateUniqueId(),
      });
      return await user.save();
    } catch (err) {
      throw err;
    }
  },

  findByUsername: async (username) => {
    return await User.findOne({ username });
  },

  findByRole: async (role) => {
    return await User.findOne({ role });
  },

  getAll: async () => {
    return await User.find().sort({ createdAt: -1 });
  },

  findById: async (id) => {
    // Accept both ObjectId (_id) or custom user id (like 'II0753') stored in `id` field
    if (mongoose.isValidObjectId(id)) {
      return await User.findById(id);
    }
    return await User.findOne({ id });
  },

  update: async (id, payload) => {
    if (mongoose.isValidObjectId(id)) {
      return await User.findByIdAndUpdate(id, payload, { new: true });
    }
    return await User.findOneAndUpdate({ id }, payload, { new: true });
  },

  remove: async (id) => {
    let result;
    if (mongoose.isValidObjectId(id)) {
      result = await User.findByIdAndDelete(id);
    } else {
      result = await User.findOneAndDelete({ id });
    }
    return result ? true : false;
  },

  searchByQuery: async (q) => {
    if (!q) return await User.find().sort({ createdAt: -1 });
    const k = q.toLowerCase();
    return await User.find({
      $or: [
        { id: { $regex: k, $options: 'i' } },
        { fullname: { $regex: k, $options: 'i' } },
        { username: { $regex: k, $options: 'i' } },
        { phone: { $regex: k, $options: 'i' } },
        { role: { $regex: k, $options: 'i' } },
        { subject: { $regex: k, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
  },
};
