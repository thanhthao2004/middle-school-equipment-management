const acceptanceService = require('../services/acceptance.service');

const CURRENT_YEAR = "2025-2026";

class AcceptanceController {

    async getListPage(req, res) {
        const selectedYear = req.query.year || "";
        const filter = {};
        if (selectedYear) filter.namHoc = selectedYear;

        const data = await acceptanceService.getList(filter);

        res.render("acceptance/views/list", {
            years: [
                "2019-2020","2020-2021","2021-2022",
                "2022-2023","2023-2024","2024-2025","2025-2026"
            ],
            selectedYear,
            currentYear: CURRENT_YEAR,
            data,
            user: req.user
        });
    }

    async getDetailPage(req, res) {
        const minute = await acceptanceService.getById(req.params.id);
        if (!minute) return res.send("Không tìm thấy biên bản");

        const details = await acceptanceService.getDetails(minute.maBienBan);

        res.render("acceptance/views/detail", {
            minute,
            details,
            user: req.user
        });
    }

    async getEditPage(req, res) {
        const minute = await acceptanceService.getById(req.params.id);
        if (!minute) return res.send("Không tìm thấy biên bản");

        if (minute.namHoc !== CURRENT_YEAR) {
            return res.redirect(`/manager/acceptance/detail/${minute._id}`);
        }

        const details = await acceptanceService.getDetails(minute.maBienBan);

        res.render("acceptance/views/edit", {
            minute,
            details,
            user: req.user
        });
    }

    // ✅ POST LƯU KẾT QUẢ
    async postEditPage(req, res) {
        const minute = await acceptanceService.getById(req.params.id);
        if (!minute) return res.send("Không tìm thấy biên bản");

        if (minute.namHoc !== CURRENT_YEAR) {
            return res.redirect(`/manager/acceptance/detail/${minute._id}`);
        }

        await acceptanceService.updateDetails(
            minute.maBienBan,
            req.body.details
        );

        await acceptanceService.markDone(minute._id);

        res.redirect(`/manager/acceptance/detail/${minute._id}`);
    }

    async getDeletePage(req, res) {
        await acceptanceService.remove(req.params.id);
        res.redirect("/manager/acceptance");
    }
}

module.exports = new AcceptanceController();
