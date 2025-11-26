const express = require("express");
const router = express.Router();

// Dummy data cho danh sách báo cáo (6 mã biên bản)
const dummyDisposal = [
    { id: 1, code: "TL001", year: "2019-2020", created_at: "07/08/2019" },
    { id: 2, code: "TL002", year: "2020-2021", created_at: "07/08/2020" },
    { id: 3, code: "TL003", year: "2021-2022", created_at: "07/08/2021" },
    { id: 4, code: "TL004", year: "2022-2023", created_at: "07/08/2022" },
    { id: 5, code: "TL005", year: "2023-2024", created_at: "07/08/2023" },
    { id: 6, code: "TL006", year: "2024-2025", created_at: "07/08/2024" }
];


// Các loại thiết bị và bộ môn
const deviceTypes = ["Máy tính", "Máy chiếu", "Máy in", "Bàn ghế", "Tủ"];
const departments = ["CNTT", "Vật lý", "Hóa học", "Sinh học", "Toán"];

// --- DANH SÁCH BÁO CÁO ---
router.get("/", (req, res) => {
    res.render("disposal/views/list", { 
        disposal: dummyDisposal,
        currentPage: 'disposal',
        user: req.user || { role: 'ql_thiet_bi' }
    });
});

// --- THÊM BÁO CÁO ---
router.get("/add", (req, res) => {
    // Sinh mã biên bản tự động
    const lastDisposal = dummyDisposal[dummyDisposal.length - 1];
    let lastCodeNumber = parseInt(lastDisposal.code.slice(2)); // bỏ "TL"
    const newCode = "TL" + String(lastCodeNumber + 1).padStart(3, "0");

    // Lấy năm học hiện tại
    const currentYear = new Date().getFullYear();
    const year = `${currentYear}-${currentYear + 1}`;

    // Ngày hôm nay
    const created_at = new Date().toLocaleDateString("vi-VN"); // dd/mm/yyyy

    // Mảng thiết bị ban đầu trống
    const devices = [];

    res.render("disposal/views/add", { 
        code: newCode, 
        year, 
        created_at, 
        devices,
        currentPage: 'disposal',
        user: req.user || { role: 'ql_thiet_bi' }
    });
});

// --- TRANG TẠO BÁO CÁO (alias for /add) ---
router.get("/create", (req, res) => {
    // Redirect to /add or render same view
    const lastDisposal = dummyDisposal[dummyDisposal.length - 1];
    let lastCodeNumber = parseInt(lastDisposal.code.slice(2));
    const newCode = "TL" + String(lastCodeNumber + 1).padStart(3, "0");
    const currentYear = new Date().getFullYear();
    const year = `${currentYear}-${currentYear + 1}`;
    const created_at = new Date().toLocaleDateString("vi-VN");
    const devices = req.query.devices ? JSON.parse(req.query.devices) : [];

    res.render("disposal/views/add", { 
        code: req.query.code || newCode, 
        year: req.query.year || year, 
        created_at: req.query.created_at || created_at, 
        devices,
        currentPage: 'disposal',
        user: req.user || { role: 'ql_thiet_bi' }
    });
});

// --- TRANG ADD DEVICES --- //
router.get("/add-devices", (req, res) => {
    const devices = [
        { id: 1, name: "Máy tính Dell", type: "Máy tính", department: "CNTT", broken_date: "15/11/2025", level: "Hỏng nặng", reason: "Hỏng ổ cứng" },
        { id: 2, name: "Máy chiếu Sony", type: "Máy chiếu", department: "Vật lý", broken_date: "10/11/2025", level: "Hỏng nặng", reason: "Hỏng bóng đèn" },
        { id: 3, name: "Bàn học sinh 1m2", type: "Bàn ghế", department: "Toán", broken_date: "12/11/2025", level: "Hỏng nặng", reason: "Mặt bàn nứt" }];
// Truyền dummy info báo cáo
    const code = "TL007"; const year = "2025-2026"; 
    const created_at = new Date().toLocaleDateString("vi-VN"); 
    res.render("disposal/views/add-devices", {
        code, 
        year, 
        created_at, 
        devices, 
        deviceTypes, 
        departments,
        currentPage: 'disposal',
        user: req.user || { role: 'ql_thiet_bi' }
    });
});

// ------------------------

// --- SỬA BÁO CÁO ---
router.get("/edit/:id", (req, res) => {
    const disposal = dummyDisposal.find(r => r.id == req.params.id) || dummyDisposal[0];

    // Thêm một số thiết bị mẫu nếu muốn hiển thị ngay khi mở
    disposal.details = [
        { name: "Máy in HP 213", type: "Máy in", department: "CNTT", broken_date: "2020-08-01", level: "Hỏng nặng", reason: "Hỏng mạch", price: "1500000" },
        { name: "Máy chiếu Sony X2", type: "Máy chiếu", department: "Vật lý", broken_date: "2020-09-05", level: "Hỏng nặng", reason: "Hỏng bóng đèn", price: "3000000" },
        { name: "Bàn học sinh 1m2", type: "Bàn ghế", department: "Toán", broken_date: "2020-10-12", level: "Hỏng nặng", reason: "Mặt bàn nứt", price: "500000" }
    ];

    // Truyền thêm deviceTypes và departments
    res.render("disposal/views/edit", { 
        disposal, 
        deviceTypes, 
        departments,
        currentPage: 'disposal',
        user: req.user || { role: 'ql_thiet_bi' }
    });
});


// --- XEM CHI TIẾT BÁO CÁO ---
router.get("/view/:id", (req, res) => {
    const disposal = {
        id: req.params.id,
        code: "TL002",
        year: "2020-2021",
        created_at: "07/08/2020",
        details: [
            {
                id: 1,
                name: "Máy in HP 213",
                type: "Máy in",
                detected_at: "01/08/2020",
                department: "CNTT",
                severity: "Hỏng nặng",
                reason: "Hỏng mạch",
                price: "1,500,000"
            },
            {
                id: 2,
                name: "Máy chiếu Sony X2",
                type: "Máy chiếu",
                detected_at: "05/09/2020",
                department: "Vật lý",
                severity: "Hỏng nặng",
                reason: "Hỏng bóng đèn",
                price: "3,000,000"
            },
            {
                id: 3,
                name: "Bàn học sinh 1m2",
                type: "Bàn ghế",
                detected_at: "12/10/2020",
                department: "Toán",
                severity: "Hỏng nặng",
                reason: "Mặt bàn nứt",
                price: "500,000"
            },
            {
                id: 4,
                name: "Tủ hồ sơ 3 ngăn",
                type: "Tủ",
                detected_at: "20/10/2020",
                department: "Hóa học",
                severity: "Hỏng nặng",
                reason: "Bản lề gãy",
                price: "1,200,000"
            },
            {
                id: 5,
                name: "Máy tính Dell Inspiron",
                type: "Máy tính",
                detected_at: "15/11/2020",
                department: "CNTT",
                severity: "Hỏng nặng",
                reason: "Hỏng ổ cứng",
                price: "8,000,000"
            }
        ]
    };

    res.render("disposal/views/view", { 
        disposal, 
        deviceTypes, 
        departments,
        currentPage: 'disposal',
        user: req.user || { role: 'ql_thiet_bi' }
    });
});

// =============================================
// PRINCIPAL ROUTES (Hiệu trưởng - Duyệt thanh lý)
// =============================================
// GET /disposal/approve - Danh sách báo cáo thanh lý cần duyệt
router.get("/approve", (req, res) => {
    const pendingDisposals = dummyDisposal.filter(d => d.status === 'pending' || !d.status);
    res.render("disposal/views/list", { 
        disposal: pendingDisposals, 
        deviceTypes, 
        departments,
        currentPage: 'disposal-approve',
        user: req.user || { role: 'hieu_truong' }
    });
});

// POST /disposal/approve/:id - Duyệt báo cáo thanh lý
router.post("/approve/:id", (req, res) => {
    // TODO: Implement approve logic
    // Check if user is principal, redirect to principal route, else manager route
    const userRole = req.user?.role || 'ql_thiet_bi';
    if (userRole === 'hieu_truong') {
        return res.redirect("/principal/disposal/approve");
    }
    return res.redirect("/manager/disposal");
});

// ==========================
// POST Routes for CRUD operations
// ==========================
router.post("/", (req, res) => {
    // TODO: Implement create disposal logic
    // For now, just redirect back to list
    res.redirect("/manager/disposal");
});

router.post("/:id", (req, res) => {
    // TODO: Implement update disposal logic
    // For now, just redirect back to list
    res.redirect("/manager/disposal");
});

router.post("/:id/delete", (req, res) => {
    // TODO: Implement delete disposal logic
    // For now, just redirect back to list
    res.redirect("/manager/disposal");
});

module.exports = router;