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
            const soLuongThucTe = Number(d.soLuongThucTe) || 0;
            const donGiaThucTe = Number(d.donGiaThucTe) || 0;
            const thanhTienThucTe = soLuongThucTe * donGiaThucTe;

            await AcceptanceDetail.updateOne(
                { _id: d.id },
                {
                    soLuongThucTe,
                    donGiaThucTe,
                    thanhTienThucTe,
                    chatLuong: d.chatLuong,
                    lyDo: d.lyDo
                }
            );
        }
    }

    async createFromPlan(planId, user) {
        const { PurchasingPlan, PurchasingPlanDetail } = require('../../purchasing-plans/models/purchasing-plan.model');

        const plan = await PurchasingPlan.findById(planId);
        if (!plan) throw new Error("Không tìm thấy kế hoạch mua sắm");

        const planDetails = await PurchasingPlanDetail.find({ maKeHoachMuaSam: plan.maKeHoachMuaSam });

        const minute = new AcceptanceMinutes({
            maKeHoachMuaSam: plan.maKeHoachMuaSam,
            namHoc: plan.namHoc,
            tenBienBan: `Nghệm thu thiết bị theo kế hoạch ${plan.maKeHoachMuaSam}`,
            trangThaiNghiemThu: "Cần nghiệm thu"
        });
        await minute.save();

        const acceptanceDetails = planDetails.map(pd => ({
            maBienBan: minute.maBienBan,
            maTB: pd.maTB,
            tenTB: pd.tenTB,
            donViTinh: pd.donViTinh,
            soLuongKeHoach: pd.soLuongDuKienMua,
            donGiaKeHoach: pd.donGia,
            soLuongThucTe: pd.soLuongDuKienMua, // Default to planned
            donGiaThucTe: pd.donGia,           // Default to planned
            thanhTienThucTe: pd.soLuongDuKienMua * pd.donGia,
            chatLuong: "Tốt"
        }));

        await AcceptanceDetail.insertMany(acceptanceDetails);
        return minute;
    }

    async remove(id) {
        const minute = await AcceptanceMinutes.findById(id);
        if (!minute) return;

        await AcceptanceDetail.deleteMany({ maBienBan: minute.maBienBan });
        await AcceptanceMinutes.deleteOne({ _id: id });
    }
}

module.exports = new AcceptanceService();
