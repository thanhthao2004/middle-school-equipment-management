const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

const AcceptanceMinutesSchema = new Schema({
    maBienBan: { type: String, required: true, unique: true, trim: true },
    maKeHoachMuaSam: { type: String, trim: true }, // Liên kết với kế hoạch mua sắm
    namHoc: { type: String, trim: true },
    trangThaiNghiemThu: { type: String, default: 'Cần nghiệm thu' },
    ngayLap: { type: Date, default: Date.now },
    tenBienBan: { type: String, trim: true },
    duongDanFile: { type: String, default: '' },
}, { timestamps: true });

AcceptanceMinutesSchema.pre("validate", async function (next) {
    if (!this.maBienBan) {
        this.maBienBan = await getNextCode("NT", 4); // NT0001
    }
    next();
});

const AcceptanceDetailSchema = new Schema({
    maBienBan: { type: String, required: true, index: true },
    maTB: { type: String, required: true },
    tenTB: { type: String, default: '' },
    donViTinh: { type: String, default: '' },
    soLuongKeHoach: { type: Number, default: 0 },
    soLuongThucTe: { type: Number, default: 0 },
    donGiaKeHoach: { type: Number, default: 0 },
    donGiaThucTe: { type: Number, default: 0 },
    thanhTienThucTe: { type: Number, default: 0 },
    chatLuong: { type: String, default: 'Tốt' },
    lyDo: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
    AcceptanceMinutes: model("AcceptanceMinutes", AcceptanceMinutesSchema),
    AcceptanceDetail: model("AcceptanceDetail", AcceptanceDetailSchema)
};
