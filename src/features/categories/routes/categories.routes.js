const express = require("express");
const path = require("path");
const router = express.Router();

// Cấu hình đường dẫn đến thư mục views của module
const viewPath = path.join(__dirname, "../views");

// Trang danh sách danh mục
router.get("/", (req, res) => {
  const categories = [
    { id: "DM01", name: "ThietBiTinHoc", location: "Phong IT" },
    { id: "DM02", name: "ThietBiHoaHoc", location: "Phong HoaHoc" },
    { id: "DM03", name: "ThietBiLichSu", location: "Phong LichSu" },
    { id: "DM04", name: "ThietBiNguVan", location: "Phong VanHoc" },
  ];

  res.render(path.join(viewPath, "list.ejs"), { categories });
});

router.get("/add", (req, res) => {
  res.render(path.join(viewPath, "add.ejs"));
});

router.get("/edit/:id", (req, res) => {
  const category = {
    id: req.params.id,
    name: "ThietBiNguVan",
    location: "Phòng Văn học"
  };
  res.render(path.join(viewPath, "edit.ejs"), { category });
});

module.exports = router;
