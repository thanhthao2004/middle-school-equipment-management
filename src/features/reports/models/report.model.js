const { Schema, model, Types } = require('mongoose');

// Báo cáo: damaged-summary (thiết bị hỏng/đã thanh lý theo thời gian)
const ReportSchema = new Schema(
	{
		type: { type: String, required: true, enum: ['damaged-summary', 'custom'] },
		fromDate: { type: Date },
		toDate: { type: Date },
		filters: {
			category: { type: Types.ObjectId, ref: 'Category' },
			supplier: { type: Types.ObjectId, ref: 'Supplier' },
			status: { type: String, trim: true },
		},
		// Kết quả tổng hợp
		summary: {
			totalDamaged: { type: Number, default: 0 },
			totalDisposed: { type: Number, default: 0 },
			byCategory: { type: Object, default: {} },
			byStatus: { type: Object, default: {} },
		},
		// Tham chiếu tài liệu phát sinh (ví dụ DisposalReport)
		sources: {
			disposalReports: [{ type: Types.ObjectId, ref: 'DisposalReport' }],
		},
		generatedAt: { type: Date, default: Date.now },
		meta: { type: Object, default: {} },
	},
	{ timestamps: true }
);

module.exports = model('Report', ReportSchema);


