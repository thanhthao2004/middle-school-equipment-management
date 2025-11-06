const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// BienBanNghiemThu
const AcceptanceMinutesSchema = new Schema(
	{
		maBienBan: { type: String, required: true, unique: true, trim: true },
		namHoc: { type: String, trim: true },
		trangThaiNghiemThu: { type: String, trim: true },
		ngayLap: { type: Date },
		tenBienBan: { type: String, trim: true },
		duongDanFile: { type: String, default: '' },
	},
	{ timestamps: true }
);

// ChiTietNghiemThu
const AcceptanceDetailSchema = new Schema(
	{
		maBienBan: { type: String, required: true, index: true },
		maTB: { type: String, required: true },
		soLuongThucTe: { type: Number, default: 0 },
		chatLuong: { type: String, default: '' },
		lyDo: { type: String, default: '' },
	},
	{ timestamps: true }
);

const AcceptanceMinutes = model('AcceptanceMinutes', AcceptanceMinutesSchema);
const AcceptanceDetail = model('AcceptanceDetail', AcceptanceDetailSchema);

AcceptanceMinutesSchema.pre('validate', async function ensureMaNT(next) {
	try {
		if (!this.maBienBan) {
			this.maBienBan = await getNextCode('NT', 3); // NT001
		}
		next();
	} catch (e) {
		next(e);
	}
});

module.exports = { AcceptanceMinutes, AcceptanceDetail };


