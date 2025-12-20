const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliers.controller");

// NCC NGỪNG HỢP TÁC
router.get("/inactive", suppliersController.getInactiveListPage);
router.post("/:id/restore", suppliersController.restoreSupplier);

// GET /manager/suppliers
router.get("/", suppliersController.getListPage);

// GET /manager/suppliers/add
router.get("/add", suppliersController.getAddPage);

// GET /manager/suppliers/edit/:id
router.get("/edit/:id", suppliersController.getEditPage);

// POST /manager/suppliers
router.post("/", suppliersController.createSupplier);

// POST /manager/suppliers/:id
router.post("/:id", suppliersController.updateSupplier);

// POST /manager/suppliers/:id/delete
router.post("/:id/delete", suppliersController.deleteSupplier);

module.exports = router;
