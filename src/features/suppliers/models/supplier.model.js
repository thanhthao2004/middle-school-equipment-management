const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// NhaCungCap
const SupplierSchema = new Schema(
	{
		maNCC: { type: String, required: true, unique: true, trim: true },
		tenNCC: { type: String, required: true, trim: true },
		diaChi: { type: String, default: '' },
		soDienThoai: { type: String, default: '' },
		email: { type: String, default: '' },
		loaiTBCC: { type: String, default: '' },
		trangThai: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = model('Supplier', SupplierSchema);

SupplierSchema.pre('validate', async function ensureMaNCC(next) {
	try {
		if (!this.maNCC) {
			this.maNCC = await getNextCode('NCC', 3); // NCC001
		}
		next();
	} catch (e) {
		next(e);
	}
});


