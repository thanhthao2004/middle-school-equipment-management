const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
	{
		id: {           // Mã danh mục, tự sinh DM01, DM02...
			type: String,
			unique: true,
		},
		name: {         // Tên danh mục
			type: String,
			required: true,
			trim: true,
		},
		location: {     // Vị trí lưu trữ
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

// Tự sinh mã danh mục dạng DM01, DM02... 
CategorySchema.pre("save", async function (next) {
	try {
		if (!this.id) {
			const Category = mongoose.model("Category");

			// Lấy danh mục có id lớn nhất (chỉ lấy những category có id hợp lệ)
			const lastCategory = await Category.findOne({ 
				id: { $exists: true, $ne: null, $type: 'string', $regex: /^DM\d+$/ } 
			}).sort({ id: -1 }).exec();

			if (!lastCategory || !lastCategory.id || typeof lastCategory.id !== 'string') {
				this.id = "DM01";
			} else {
				const idMatch = lastCategory.id.match(/^DM(\d+)$/);
				if (!idMatch) {
					this.id = "DM01";
				} else {
					const lastNumber = parseInt(idMatch[1], 10) || 0;
					this.id = "DM" + String(lastNumber + 1).padStart(2, "0");
				}
			}
		}
		next();
	} catch (err) {
		next(err);
	}
});

module.exports = mongoose.model("Category", CategorySchema);
