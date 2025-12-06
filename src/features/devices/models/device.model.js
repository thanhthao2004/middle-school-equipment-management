const { Schema, model, Types } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// ThietBi
const DeviceSchema = new Schema(
	{
		maTB: { type: String, required: true, unique: true, trim: true },
		tenTB: { type: String, required: true, trim: true },
		nguonGoc: { type: String, default: '' },
		soLuong: { type: Number, default: 0 },
		giaThanh: { type: Number, default: 0 }, // Unit price (giá thành mua)
		tinhTrangThietBi: { type: String, default: '' }, // Physical condition: Tốt, Khá, Trung bình, Hỏng
		viTriLuuTru: { type: String, default: '' },
		ngayNhap: { type: Date },
		hinhAnh: { type: [String], default: [] }, // Array of image paths (multiple images)
		huongDanSuDung: { type: String, default: '' },
		maDM: { type: String, trim: true },
		category: { type: Types.ObjectId, ref: 'Category' },
	},
	{ timestamps: true }
);

// Virtual field: Total value (tongGia = giaThanh × soLuong)
DeviceSchema.virtual('tongGia').get(function () {
	return this.giaThanh * this.soLuong;
});

DeviceSchema.pre('validate', async function ensureMaTB(next) {
	try {
		if (!this.maTB) {
			this.maTB = await getNextCode('TB', 3); // TB001
		}
		next();
	} catch (e) {
		next(e);
	}
});
module.exports = model('Device', DeviceSchema);