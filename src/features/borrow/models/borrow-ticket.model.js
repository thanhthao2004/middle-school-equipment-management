const { Schema, model, Types } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// PhieuMuon: thông tin chung của một lần mượn (có thể mượn nhiều thiết bị)
const BorrowTicketSchema = new Schema(
	{
		maPhieu: { type: String, required: true, unique: true, trim: true },
		ngayMuon: { type: Date },
		ngayDuKienTra: { type: Date },
		lyDo: { type: String, default: '' },
		nguoiLapPhieuId: { type: Types.ObjectId, ref: 'User', required: true },
		trangThai: { type: String, default: 'dang_muon', trim: true }, // dang_muon | da_hoan_tat | huy
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

// ChiTietPhieuMuon: danh sách thiết bị và số lượng được mượn theo từng phiếu mượn
const BorrowDetailSchema = new Schema(
	{
		maPhieu: { type: String, required: true, index: true },
		maTB: { type: String, required: true },
		soLuongMuon: { type: Number, required: true, min: 1 },
		ngayTraDuKien: { type: Date },
		tinhTrangLucMuon: { type: String, default: '' },
		soLuongDaTra: { type: Number, default: 0, min: 0 }, // tổng đã trả (cộng dồn từ các phiếu trả)
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

// PhieuTra: một phiếu trả có thể trả một phần các thiết bị trong phiếu mượn
const ReturnSlipSchema = new Schema(
	{
		maPhieuTra: { type: String, required: true, unique: true, trim: true },
		maPhieuMuon: { type: String, required: true, index: true },
		ngayTra: { type: Date },
		nguoiTraId: { type: Types.ObjectId, ref: 'User', required: true },
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

// ChiTietPhieuTra: chi tiết các thiết bị được trả trong một phiếu trả (có thể trả nhiều lần)
const ReturnDetailSchema = new Schema(
	{
		maPhieuTra: { type: String, required: true, index: true },
		maTB: { type: String, required: true },
		soLuongTra: { type: Number, required: true, min: 1 },
		tinhTrangLucTra: { type: String, default: '' },
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

const BorrowTicket = model('BorrowTicket', BorrowTicketSchema);
const BorrowDetail = model('BorrowDetail', BorrowDetailSchema);
const ReturnSlip = model('ReturnSlip', ReturnSlipSchema);
const ReturnDetail = model('ReturnDetail', ReturnDetailSchema);

module.exports = { BorrowTicket, BorrowDetail, ReturnSlip, ReturnDetail };

BorrowTicketSchema.pre('validate', async function ensureMaPM(next) {
	try {
		if (!this.maPhieu) {
			this.maPhieu = await getNextCode('PM', 4); // PM0001
		}
		next();
	} catch (e) {
		next(e);
	}
});

ReturnSlipSchema.pre('validate', async function ensureMaPT(next) {
	try {
		if (!this.maPhieuTra) {
			this.maPhieuTra = await getNextCode('PT', 4); // PT0001
		}
		next();
	} catch (e) {
		next(e);
	}
});