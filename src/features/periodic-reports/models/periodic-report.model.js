const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// BaoCaoTinhTrangTBBinhKy
const PeriodicReportSchema = new Schema(
	{
		maBaoCao: { type: String, required: true, unique: true, trim: true },
		kyBaoCao: { type: String, trim: true },
		ngayLap: { type: Date },
		trangThaiBaoCao: { type: String, trim: true },
		tenFile: { type: String, trim: true },
		duongDanFile: { type: String, default: '' },

		// Snapshot dữ liệu thiết bị tại thời điểm báo cáo
		items: [{
			maTB: String,
			tenTB: String,
			soLuong: Number,
			donViTinh: String,
			categoryName: String,
			stats: {
				tot: { type: Number, default: 0 },
				kha: { type: Number, default: 0 },
				trungBinh: { type: Number, default: 0 },
				hong: { type: Number, default: 0 }
			},
			ghiChu: String
		}]
	},
	{ timestamps: true }
);


PeriodicReportSchema.pre('validate', async function ensureMaBC(next) {
	try {
		if (!this.maBaoCao) {
			this.maBaoCao = await getNextCode('BC', 3); // BC001
		}
		next();
	} catch (e) {
		next(e);
	}
});
module.exports = model('PeriodicReport', PeriodicReportSchema);
