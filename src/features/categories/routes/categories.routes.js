const express = require("express");
const path = require("path");
const router = express.Router();

// Cấu hình đường dẫn đến thư mục views của module
const viewPath = path.join(__dirname, "../views");

// Trang danh sách danh mục
router.get("/", (req, res) => {
  //mấy cái này là check model hoi
  const categories = [
    { id: "DM01", name: "ThietBiTinHoc", location: "Phong IT" },
    { id: "DM02", name: "ThietBiHoaHoc", location: "Phong HoaHoc" },
    { id: "DM03", name: "ThietBiLichSu", location: "Phong LichSu" },
    { id: "DM04", name: "ThietBiNguVan", location: "Phong VanHoc" },
  ];

  res.render(path.join(viewPath, "list.ejs"), { 
    categories,
    currentPage: 'categories',
    user: req.user || { role: 'ql_thiet_bi' }
  });
});

router.get("/add", (req, res) => {
  res.render(path.join(viewPath, "add.ejs"), {
    currentPage: 'categories',
    user: req.user || { role: 'ql_thiet_bi' }
  });
});

router.get("/edit/:id", (req, res) => {
  const category = {
    id: req.params.id,
    name: "ThietBiNguVan",
    location: "Phòng Văn học"
  };
  res.render(path.join(viewPath, "edit.ejs"), { 
    category,
    currentPage: 'categories',
    user: req.user || { role: 'ql_thiet_bi' }
  });
});

module.exports = router;