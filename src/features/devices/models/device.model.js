const { Schema, model, Types } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

/**
 * Device - Loại thiết bị (thông tin chung)
 * 
 * Ví dụ: "Nam châm điện" là một loại thiết bị
 * Số lượng thực tế được quản lý qua DeviceUnit
 * 
 * Quan hệ: Device (1) → DeviceUnit (N)
 */
const DeviceSchema = new Schema(
	{
		maTB: { type: String, required: true, unique: true, trim: true },
		tenTB: { type: String, required: true, trim: true },
		nguonGoc: { type: String, default: '' },

		// Số lượng tổng (tham khảo, số thực tế lấy từ DeviceUnit)
		soLuong: { type: Number, default: 0 },

		giaThanh: { type: Number, default: 0 }, // Unit price (giá thành mua)

		// Đã bỏ tinhTrangThietBi - tình trạng được quản lý ở từng DeviceUnit
		// Legacy field - giữ lại để backward compatible
		tinhTrangThietBi: { type: String, default: 'Tốt' },

		viTriLuuTru: { type: String, default: '' },
		ngayNhap: { type: Date },
		hinhAnh: { type: [String], default: [] }, // Array of image paths (multiple images)
		huongDanSuDung: { type: String, default: '' },
		maDM: { type: String, trim: true },
		category: { type: Types.ObjectId, ref: 'Category' },
		supplier: { type: Types.ObjectId, ref: 'Supplier' }, // Nhà cung cấp
		lop: { type: [String], default: [] }, // Array of classes: ['6', '7', '8', '9']
	},
	{ timestamps: true }
);

// Virtual field: Total value (tongGia = giaThanh × soLuong)
DeviceSchema.virtual('tongGia').get(function () {
	return this.giaThanh * this.soLuong;
});

// Virtual populate để lấy danh sách đơn vị
DeviceSchema.virtual('units', {
	ref: 'DeviceUnit',
	localField: 'maTB',
	foreignField: 'maTB'
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

// Ensure virtuals are included in JSON
DeviceSchema.set('toJSON', { virtuals: true });
DeviceSchema.set('toObject', { virtuals: true });

module.exports = model('Device', DeviceSchema);