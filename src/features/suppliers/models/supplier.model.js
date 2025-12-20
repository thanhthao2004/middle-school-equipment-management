const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
	{
		maNCC: {
			type: String,
			unique: true
		},

		// ✅ Khớp đúng với name trong form <input name="name">
		name: {
			type: String,
			required: true,
			trim: true
		},

		address: {
			type: String,
			trim: true
		},

		phone: {
			type: String,
			trim: true
		},

		email: {
			type: String,
			trim: true
		},

		// Loại thiết bị cung cấp
		type: {
			type: String,
			trim: true
		},

		contractDate: {
			type: Date
		},

		status: {
			type: String,
			enum: ["Hoạt động", "Ngừng hợp tác"],
			default: "Hoạt động"
		}
	},
	{ timestamps: true }
);

// ✅ Tự sinh mã NCC dạng NCC001, NCC002...
SupplierSchema.pre("save", async function (next) {
	try {
		if (!this.maNCC) {
			const Supplier = mongoose.model("Supplier");
			const count = await Supplier.countDocuments();
			this.maNCC = "NCC" + String(count + 1).padStart(3, "0");
		}
		next();
	} catch (err) {
		next(err);
	}
});

module.exports = mongoose.model("Supplier", SupplierSchema);
