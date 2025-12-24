const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliers.controller");

// =============================
// NCC NGỪNG HỢP TÁC
// =============================
router.get("/inactive", suppliersController.getInactiveListPage);
router.post("/:id/restore", suppliersController.restoreSupplier);

// =============================
// ADD – PHẢI ĐẶT TRƯỚC
// =============================
router.get("/add", suppliersController.getAddPage);

// =============================
// LIST
// =============================
router.get("/", suppliersController.getListPage);

// =============================
// EDIT
// =============================
router.get("/edit/:id", suppliersController.getEditPage);

// =============================
// CREATE
// =============================
router.post("/", suppliersController.createSupplier);

// =============================
// UPDATE + DELETE (ROUTE ĐỘNG)
// =============================
router.post("/:id/delete", suppliersController.deleteSupplier);
router.post("/:id", suppliersController.updateSupplier);

module.exports = router;
