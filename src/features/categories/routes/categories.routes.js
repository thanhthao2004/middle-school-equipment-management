const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");

// GET danh sách
router.get("/", categoriesController.getListPage);

// GET thêm mới
router.get("/add", categoriesController.getAddPage);

// GET sửa
router.get("/edit/:id", categoriesController.getEditPage);

// POST thêm mới
router.post("/", categoriesController.createCategory);

// POST cập nhật
router.post("/:id", categoriesController.updateCategory);

// POST xóa
router.post("/:id/delete", categoriesController.deleteCategory);

module.exports = router;
