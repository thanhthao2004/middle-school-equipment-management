const { Schema, model } = require('mongoose');

// KeHoachMuaSamThietBi
const PurchasingPlanSchema = new Schema(
	{
		maKeHoachMuaSam: { type: String, required: true, unique: true, trim: true },
		namHoc: { type: String, trim: true },
		trangThai: { type: String, trim: true },
		tenFile: { type: String, trim: true },
		duongDanFile: { type: String, default: '' },
	},
	{ timestamps: true }
);

// ChiTietKeHoachMuaSamThietBi
const PurchasingPlanDetailSchema = new Schema(
	{
		maKeHoachMuaSam: { type: String, required: true, index: true },
		maTB: { type: String, required: true },
		tenTB: { type: String, default: '' },           // Tên thiết bị
		tenDanhMuc: { type: String, default: '' },     // Tên danh mục
		soLuongDuKienMua: { type: Number, default: 0 },
		donViTinh: { type: String, trim: true },
		donGia: { type: Number, default: 0 },           // Thêm cột đơn giá
		nguonGoc: { type: String, default: '' },        // Nguồn gốc
		thoiGianDuKienMua: { type: Date },
		duToanKinhPhi: { type: Number, default: 0 },
		lyDoMua: { type: String, default: '' },
	},
	{ timestamps: true }
);

const PurchasingPlan = model('PurchasingPlan', PurchasingPlanSchema);
const PurchasingPlanDetail = model('PurchasingPlanDetail', PurchasingPlanDetailSchema);

// Note: Không cần pre-validate hook vì mã kế hoạch được tạo ở repository layer
// để đảm bảo tính nhất quán và dễ quản lý trong transaction

module.exports = { PurchasingPlan, PurchasingPlanDetail };