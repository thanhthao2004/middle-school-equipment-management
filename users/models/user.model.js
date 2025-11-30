const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    address: String,
    email: String,
    role: {
      type: String,
      enum: ['principal', 'teacher', 'staff', 'user'],
      default: 'user',
    },
    experience: String, // Năm kinh nghiệm
    specialization: String, // Chuyên môn
    gender: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
    },
    subject: String, // Bộ môn
    vision: String,
    dob: Date, // Ngày sinh
  },
  { timestamps: true }
);

// Ensure only one principal (Hiệu trưởng) exists in the system.
// Pre-save hook for create/save
UserSchema.pre('save', async function (next) {
  try {
    if (this.role === 'principal') {
      // find another principal with different id
      const existing = await mongoose.model('User').findOne({ role: 'principal', _id: { $ne: this._id } });
      if (existing) {
        const err = new Error('Hệ thống chỉ cho phép 1 Hiệu trưởng!');
        return next(err);
      }
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

// Pre findOneAndUpdate hook for updates via queries (covers repository updates)
UserSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate() || {};
    // Normalize if using $set
    const role = update.role || (update.$set && update.$set.role);
    if (role === 'principal') {
      // determine current document identifier from query
      const query = this.getQuery() || {};
      // look for existing principal excluding the current document
      const existing = await mongoose.model('User').findOne({ role: 'principal' });
      if (existing) {
        // if existing is same as current (by _id or custom id field), allow
        const currentIsSame = (query._id && existing._id.equals(query._id)) || (query.id && existing.id === query.id);
        if (!currentIsSame) {
          const err = new Error('Hệ thống chỉ cho phép 1 Hiệu trưởng!');
          return next(err);
        }
      }
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model("User", UserSchema);
