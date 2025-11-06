const { Schema, model, Types } = require('mongoose');

// Hồ sơ người dùng, tham chiếu User
const ProfileSchema = new Schema(
	{
		userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
		avatarUrl: { type: String, default: '' },
		ngaySinh: { type: Date },
		gioiTinh: { type: String, trim: true },
		noiCongTac: { type: String, trim: true },
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = model('Profile', ProfileSchema);


