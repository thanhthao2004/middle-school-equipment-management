const { Schema, model, Types } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

// PhieuMuon: thông tin chung của một lần mượn (có thể mượn nhiều thiết bị)
const BorrowTicketSchema = new Schema(
	{
		maPhieu: { type: String, required: true, unique: true, trim: true },
		ngayMuon: { type: Date },
		ngayDuKienTra: { type: Date },
		caMuon: { type: String, enum: ['sang', 'chieu'], required: true, default: 'sang' }, // Shift for borrow date
		caTra: { type: String, enum: ['sang', 'chieu'], required: true, default: 'sang' }, // Shift for return date
		lyDo: { type: String, default: '' },
		nguoiLapPhieuId: { type: Types.ObjectId, ref: 'User', required: true },
		trangThai: { type: String, default: 'cho_duyet', trim: true }, // cho_duyet | dang_muon | approved | da_tra_mot_phan | da_hoan_tat | huy | rejected
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

// Add compound index for efficient slot-based queries
BorrowTicketSchema.index({ ngayMuon: 1, caMuon: 1, trangThai: 1 });
BorrowTicketSchema.index({ ngayDuKienTra: 1, caTra: 1, trangThai: 1 });

// ChiTietPhieuMuon: danh sách thiết bị và số lượng được mượn theo từng phiếu mượn
const BorrowDetailSchema = new Schema(
	{
		maPhieu: { type: String, required: true, index: true },
		maTB: { type: String, required: true },
		soLuongMuon: { type: Number, required: true, min: 1 },
		ngayTraDuKien: { type: Date },
		tinhTrangLucMuon: { type: String, default: '' },
		soLuongDaTra: { type: Number, default: 0, min: 0 }, // tổng đã trả (cộng dồn từ các phiếu trả)
		trangThai: {
			type: String,
			enum: ['dang_muon', 'da_tra_mot_phan', 'da_tra_het'],
			default: 'dang_muon'
		}, // Trạng thái của thiết bị này
		maPhieuTra: { type: String, default: null, index: true }, // Tham chiếu đến phiếu trả (nếu đã trả)
		
		// Danh sách mã đơn vị thiết bị cụ thể được mượn (ví dụ: ['TB001-001', 'TB001-002'])
		danhSachDonVi: { type: [String], default: [] },
		
		ghiChu: { type: String, default: '' },
	},
	{ timestamps: true }
);

// Add compound index for efficient queries
BorrowDetailSchema.index({ maPhieu: 1, trangThai: 1 });
BorrowDetailSchema.index({ maTB: 1, trangThai: 1 });

// Pre-validate hook for auto-generating maPhieu - MUST be defined BEFORE model()
BorrowTicketSchema.pre('validate', async function ensureMaPM(next) {
	try {
		if (!this.maPhieu) {
			console.log('[BorrowTicket] Generating maPhieu...');
			this.maPhieu = await getNextCode('PM', 4); // PM0001
			console.log('[BorrowTicket] Generated maPhieu:', this.maPhieu);
		}
		next();
	} catch (e) {
		console.error('[BorrowTicket] Error generating maPhieu:', e);
		next(e);
	}
});

// PhieuTra: một phiếu trả có thể trả một phần các thiết bị trong phiếu mượn
const ReturnSlipSchema = new Schema(
	{
		maPhieuTra: { type: String, required: true, unique: true, trim: true },
		maPhieuMuon: { type: String, required: true, index: true },
		ngayTra: { type: Date },
		caTraThucTe: { type: String, enum: ['sang', 'chieu'], default: 'sang' }, // Ca trả thực tế
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

// Pre-validate hook for auto-generating maPhieuTra - MUST be defined BEFORE model()
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

// Create models AFTER all hooks are defined
const BorrowTicket = model('BorrowTicket', BorrowTicketSchema);
const BorrowDetail = model('BorrowDetail', BorrowDetailSchema);
const ReturnSlip = model('ReturnSlip', ReturnSlipSchema);
const ReturnDetail = model('ReturnDetail', ReturnDetailSchema);

module.exports = { BorrowTicket, BorrowDetail, ReturnSlip, ReturnDetail };