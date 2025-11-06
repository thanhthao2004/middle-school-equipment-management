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
	},
	{ timestamps: true }
);

module.exports = model('PeriodicReport', PeriodicReportSchema);

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