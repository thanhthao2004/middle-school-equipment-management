const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

const AcceptanceMinutesSchema = new Schema({
    maBienBan: { type: String, required: true, unique: true, trim: true },
    namHoc: { type: String, trim: true },
    trangThaiNghiemThu: { type: String, default: 'Cần nghiệm thu' },
    ngayLap: { type: Date, default: Date.now },
    tenBienBan: { type: String, trim: true },
    duongDanFile: { type: String, default: '' },
}, { timestamps: true });

AcceptanceMinutesSchema.pre("validate", async function(next) {
    if (!this.maBienBan) {
        this.maBienBan = await getNextCode("NT", 3);
    }
    next();
});

const AcceptanceDetailSchema = new Schema({
    maBienBan: { type: String, required: true, index: true },
    maTB: { type: String, required: true },
    soLuongThucTe: { type: Number, default: 0 },
    chatLuong: { type: String, default: '' },
    lyDo: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
    AcceptanceMinutes: model("AcceptanceMinutes", AcceptanceMinutesSchema),
    AcceptanceDetail: model("AcceptanceDetail", AcceptanceDetailSchema)
};
