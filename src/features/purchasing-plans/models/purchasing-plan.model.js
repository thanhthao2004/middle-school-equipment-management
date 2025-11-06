const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

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
		soLuongDuKienMua: { type: Number, default: 0 },
		donViTinh: { type: String, trim: true },
		thoiGianDuKienMua: { type: Date },
		duToanKinhPhi: { type: Number, default: 0 },
		lyDoMua: { type: String, default: '' },
	},
	{ timestamps: true }
);

const PurchasingPlan = model('PurchasingPlan', PurchasingPlanSchema);
const PurchasingPlanDetail = model('PurchasingPlanDetail', PurchasingPlanDetailSchema);

PurchasingPlanSchema.pre('validate', async function ensureMaKH(next) {
	try {
		if (!this.maKeHoachMuaSam) {
			this.maKeHoachMuaSam = await getNextCode('KH', 3); // KH001
		}
		next();
	} catch (e) {
		next(e);
	}
});

module.exports = { PurchasingPlan, PurchasingPlanDetail };


