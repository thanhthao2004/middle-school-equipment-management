class AcceptanceController {

    // ========================
    // LIST PAGE
    // ========================
    getListPage(req, res) {

        const years = [
            "2019-2020",
            "2020-2021",
            "2021-2022",
            "2022-2023",
            "2023-2024",
            "2024-2025",
            "2025-2026"
        ];

        const selectedYear = req.query.year || "2019-2020";

        const data = [
            { id: "NT001", year: "2019-2020", status: "Đã nghiệm thu" },
            { id: "NT002", year: "2020-2021", status: "Đã nghiệm thu" },
            { id: "NT003", year: "2021-2022", status: "Đã nghiệm thu" },
            { id: "NT004", year: "2022-2023", status: "Đã nghiệm thu" },
            { id: "NT005", year: "2023-2024", status: "Đã nghiệm thu" },
            { id: "NT006", year: "2024-2025", status: "Đã nghiệm thu" },
            { id: "NT007", year: "2025-2026", status: "Cần nghiệm thu" }
        ];

        res.render("acceptance/views/list", {
            title: "Nghiệm thu thiết bị",
            currentPage: "acceptance",
            years,
            selectedYear,
            data,
            user: req.user || { role: 'ql_thiet_bi' }
        });
    }

    // ========================
    // EDIT PAGE
    // ========================
    async getEditPage(req, res) {

        const id = req.params.id;

        const items = [
            { stt: 1, category: "Thiết bị dạy môn", code: "TBO", name: "Bộ thiết bị vẽ trên bảng trong", qtyPlan: 5, qtyReal: 5, quality: "Tốt", reason: "" },
            { stt: 2, category: "Thiết bị dạy môn", code: "TBO", name: "Bộ thí nghiệm cơ học", qtyPlan: 3, qtyReal: 3, quality: "Khá", reason: "Bị gãy 1 bộ" },
            { stt: 3, category: "Thiết bị dạy Hóa", code: "TBO", name: "Bộ dụng cụ thí nghiệm hóa học", qtyPlan: 4, qtyReal: 4, quality: "Tốt", reason: "Bể ống TN" },
            { stt: 4, category: "Thiết bị dạy Sinh", code: "TBO", name: "Bộ kính hiển vi", qtyPlan: 2, qtyReal: 2, quality: "Trung bình", reason: "1 kính bị mờ" },
            { stt: 5, category: "Thiết bị dạy Tin", code: "TBO", name: "Máy chiếu", qtyPlan: 1, qtyReal: 1, quality: "Tốt", reason: "" }
        ];

        res.render("acceptance/views/edit", {
            title: `Chi tiết nghiệm thu ${id}`,
            currentPage: "acceptance",
            id,
            items,
            user: req.user || { role: 'ql_thiet_bi' }
        });
    }

    // ========================
    // DELETE PAGE
    // ========================
    async getDeletePage(req, res) {

        const id = req.params.id;

        res.render("acceptance/views/delete-item", {
            title: "Xóa mục nghiệm thu",
            currentPage: "acceptance",
            id,
            user: req.user || { role: 'ql_thiet_bi' }
        });
    }
}

module.exports = new AcceptanceController();
