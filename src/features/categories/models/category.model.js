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

			// Lấy TẤT CẢ categories có id hợp lệ
			const categories = await Category.find({
				id: { $exists: true, $ne: null, $type: 'string', $regex: /^DM\d+$/ }
			}).lean().exec();

			if (!categories || categories.length === 0) {
				this.id = "DM01";
				console.log('[Category] Generated first ID: DM01');
			} else {
				// Extract số từ tất cả IDs và tìm max
				const numbers = categories
					.map(cat => {
						const match = cat.id.match(/^DM(\d+)$/);
						return match ? parseInt(match[1], 10) : 0;
					})
					.filter(num => !isNaN(num) && num > 0);

				const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
				const nextId = "DM" + String(maxNumber + 1).padStart(2, "0");
				this.id = nextId;
				console.log(`[Category] Generated ID: ${nextId} (max was ${maxNumber})`);
			}
		}
		next();
	} catch (err) {
		console.error('[Category] Error in pre-save hook:', err);
		next(err);
	}
});

module.exports = mongoose.model("Category", CategorySchema);
