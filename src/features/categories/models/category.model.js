const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// DanhMucThietBi
const CategorySchema = new Schema(
	{
		maDM: { type: String, required: true, unique: true, trim: true },
		tenDM: { type: String, required: true, trim: true },
		viTriLuuTru: { type: String, default: '' },
	},
	{ timestamps: true }
);


CategorySchema.pre('validate', async function ensureMaDM(next) {
	try {
		if (!this.maDM) {
			this.maDM = await getNextCode('DM', 3); // DM001
		}
		next();
	} catch (e) {
		next(e);
	}
});
module.exports = model('Category', CategorySchema);