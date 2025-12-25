const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// User (tương ứng NhanVien theo domain)
const UserSchema = new Schema(
	{
		maNV: { type: String, required: true, unique: true, trim: true },
		hoTen: { type: String, required: true, trim: true },
		username: { type: String, required: true, unique: true, trim: true, lowercase: true },
		email: { type: String, default: '', lowercase: true, trim: true }, // Optional, not unique
		soDienThoai: { type: String, default: '' },
		diaChi: { type: String, default: '' },
		chucVu: { type: String, default: '' },
		role: { type: String, required: true, trim: true }, // admin | giao_vien | to_truong | ql_thiet_bi | hieu_truong
		matKhauHash: { type: String, required: true },
		trangThai: { type: String, default: 'active', trim: true }, // active | inactive

		// Additional Info
		ngaySinh: { type: Date },
		gioiTinh: { type: String, enum: ['Nam', 'Nữ'], default: 'Nam' },
		boMon: { type: String, default: '' },
		trinhDo: { type: String, default: '' },

		// Registration token fields for first-time login
		registrationToken: { type: String, unique: true, sparse: true },
		registrationTokenExpiry: { type: Date },
		isActive: { type: Boolean, default: true },
		firstLogin: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

UserSchema.index({ maNV: 1 });
UserSchema.index({ username: 1 });

UserSchema.pre('validate', async function ensureMaNV(next) {
	try {
		if (!this.maNV) {
			this.maNV = await getNextCode('NV', 3); // NV001
		}
		next();
	} catch (e) {
		next(e);
	}
});

module.exports = model('User', UserSchema);
