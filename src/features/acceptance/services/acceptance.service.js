const {
    AcceptanceMinutes,
    AcceptanceDetail
} = require('../models/acceptance.model');

class AcceptanceService {

    getList(filter) {
        return AcceptanceMinutes.find(filter).sort({ namHoc: 1 });
    }

    getById(id) {
        return AcceptanceMinutes.findById(id);
    }

    getDetails(maBienBan) {
        return AcceptanceDetail.find({ maBienBan });
    }

    async updateDetails(maBienBan, detailsFromForm) {
        if (!detailsFromForm) return;

        for (const d of detailsFromForm) {
            await AcceptanceDetail.updateOne(
                { _id: d.id },
                {
                    soLuongThucTe: d.soLuongThucTe,
                    chatLuong: d.chatLuong,
                    lyDo: d.lyDo
                }
            );
        }
    }

    async markDone(id) {
        await AcceptanceMinutes.updateOne(
            { _id: id },
            { trangThaiNghiemThu: "Đã nghiệm thu" }
        );
    }

    async remove(id) {
        const minute = await AcceptanceMinutes.findById(id);
        if (!minute) return;

        await AcceptanceDetail.deleteMany({ maBienBan: minute.maBienBan });
        await AcceptanceMinutes.deleteOne({ _id: id });
    }
}

module.exports = new AcceptanceService();
