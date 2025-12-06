const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// User (tương ứng NhanVien theo domain)
const UserSchema = new Schema(
	{
		maNV: { type: String, required: true, unique: true, trim: true },
		hoTen: { type: String, required: true, trim: true },
		username: { type: String, required: true, unique: true, trim: true, lowercase: true },
		email: { type: String, required: true, lowercase: true, trim: true, unique: true },
		soDienThoai: { type: String, default: '' },
		diaChi: { type: String, default: '' },
		chucVu: { type: String, default: '' },
		role: { type: String, required: true, trim: true }, // admin | giao_vien | to_truong | ql_thiet_bi | hieu_truong
		matKhauHash: { type: String, required: true },
		trangThai: { type: String, default: 'active', trim: true }, // active | inactive
	},
	{ timestamps: true }
);

UserSchema.index({ maNV: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

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
