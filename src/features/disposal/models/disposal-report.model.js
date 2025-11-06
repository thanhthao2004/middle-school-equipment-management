const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// TB_ThanhLy
const DisposalTicketSchema = new Schema(
	{
		maThanhLy: { type: String, required: true, unique: true, trim: true },
		soLuong: { type: Number, default: 0 },
		tinhTrangDuyet: { type: String, trim: true },
		mucDoHong: { type: String, trim: true },
		duongDanFile: { type: String, default: '' },
	},
	{ timestamps: true }
);

// BaoCaoThanhLyTB
const DisposalReportSchema = new Schema(
	{
		maBaoCao: { type: String, required: true, unique: true, trim: true },
		namHoc: { type: String, trim: true },
		ngayLapBaoCao: { type: Date },
		trangThai: { type: String, trim: true },
		tenFile: { type: String, trim: true },
		duongDanFile: { type: String, default: '' },
	},
	{ timestamps: true }
);

// ChiTietThanhLy
const DisposalDetailSchema = new Schema(
	{
		maThanhLy: { type: String, required: true, index: true },
		maTB: { type: String, required: true },
		lyDo: { type: String, default: '' },
		mucDoHong: { type: String, default: '' },
		giaBan: { type: Number, default: 0 },
		ngayBan: { type: Date },
	},
	{ timestamps: true }
);

const DisposalTicket = model('DisposalTicket', DisposalTicketSchema);
const DisposalReport = model('DisposalReport', DisposalReportSchema);
const DisposalDetail = model('DisposalDetail', DisposalDetailSchema);

module.exports = { DisposalTicket, DisposalReport, DisposalDetail };

DisposalTicketSchema.pre('validate', async function ensureMaTL(next) {
	try {
		if (!this.maThanhLy) {
			this.maThanhLy = await getNextCode('TL', 3); // TL001
		}
		next();
	} catch (e) {
		next(e);
	}
});

DisposalReportSchema.pre('validate', async function ensureMaTLBC(next) {
	try {
		if (!this.maBaoCao) {
			this.maBaoCao = await getNextCode('TLBC', 3); // TLBC001
		}
		next();
	} catch (e) {
		next(e);
	}
});


