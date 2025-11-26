// src/features/suppliers/routes/suppliers.routes.js
const express = require("express");
const path = require("path");
const router = express.Router();

// Thư mục views của module suppliers
const viewPath = path.join(__dirname, "../views");

// ==========================
// Route danh sách nhà cung cấp
// ==========================
router.get("/", (req, res) => {
  const suppliers = [
    {
      id: "NCC01",
      name: "Công ty ABC",
      address: "Hà Nội",
      phone: "0123456789",
      email: "abc@company.com",
      type: "Thiết bị tin học",
      contractDate: "2023-01-15",
      status: "Đang hợp tác"
    },
    {
      id: "NCC02",
      name: "Công ty XYZ",
      address: "TP.HCM",
      phone: "0987654321",
      email: "xyz@company.com",
      type: "Thiết bị hóa học",
      contractDate: "2022-07-20",
      status: "Ngừng hợp tác"
    },
    {
      id: "NCC03",
      name: "Công ty DEF",
      address: "Đà Nẵng",
      phone: "0912345678",
      email: "def@company.com",
      type: "Thiết bị lịch sử",
      contractDate: "2021-05-10",
      status: "Đang hợp tác"
    }
  ];

  res.render(path.join(viewPath, "list.ejs"), { 
    suppliers,
    currentPage: 'suppliers',
    user: req.user || { role: 'ql_thiet_bi' }
  });
});

// ==========================
// Route thêm nhà cung cấp
// ==========================
router.get("/add", (req, res) => {
  res.render(path.join(viewPath, "add.ejs"), {
    currentPage: 'suppliers',
    user: req.user || { role: 'ql_thiet_bi' }
  });
});

// ==========================
// Route chỉnh sửa nhà cung cấp
// ==========================
router.get("/edit/:id", (req, res) => {
  // Dữ liệu mẫu tạm
  const supplier = {
    id: req.params.id,
    name: "Công ty ABC",
    address: "Hà Nội",
    phone: "0123456789",
    email: "abc@company.com",
    type: "Thiết bị tin học",
    contractDate: "2023-01-15",
    status: "Đang hợp tác"
  };

  res.render(path.join(viewPath, "edit.ejs"), { 
    supplier,
    currentPage: 'suppliers',
    user: req.user || { role: 'ql_thiet_bi' }
  });
});

// ==========================
// Export router
// ==========================
module.exports = router;
