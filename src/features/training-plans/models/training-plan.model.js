const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// KeHoachDaoTao
const TrainingPlanSchema = new Schema(
	{
		maKeHoachDaoTao: { type: String, required: true, unique: true, trim: true },
		namHoc: { type: String, trim: true },
		ngayLap: { type: Date },
		tenFile: { type: String, trim: true },
		tenHienThi: { type: String, trim: true },
		duongDanFile: { type: String, default: '' },
	},
	{ timestamps: true }
);

TrainingPlanSchema.pre('validate', async function ensureMaDT(next) {
	try {
		if (!this.maKeHoachDaoTao) {
			this.maKeHoachDaoTao = await getNextCode('DT', 3); // DT001
		}
		next();
	} catch (e) {
		next(e);
	}
});

module.exports = model('TrainingPlan', TrainingPlanSchema);