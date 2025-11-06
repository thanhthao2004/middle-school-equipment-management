const { Schema, model, Types } = require('mongoose');

// Thống kê thiết bị gộp theo danh mục/tình trạng/nhà cung cấp
const DeviceStatsSchema = new Schema(
	{
		// Khóa tổng hợp (có thể để null nếu là toàn cục)
		category: { type: Types.ObjectId, ref: 'Category' }, // từ devices.model.js -> category
		maDM: { type: String, trim: true },
		supplier: { type: Types.ObjectId, ref: 'Supplier' },
		status: { type: String, trim: true }, // từ devices.model.js -> tinhTrangThietBi

		// Số liệu
		totalDevices: { type: Number, default: 0 },
		available: { type: Number, default: 0 },
		borrowed: { type: Number, default: 0 },
		broken: { type: Number, default: 0 },
		disposed: { type: Number, default: 0 }, // liên quan disposal
	},
	{ timestamps: true }
);

DeviceStatsSchema.index({ category: 1, maDM: 1, supplier: 1, status: 1 }, { unique: false });

module.exports = model('DeviceStats', DeviceStatsSchema);


