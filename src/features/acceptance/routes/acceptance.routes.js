const express = require("express");
const router = express.Router();
const controller = require("../controllers/acceptance.controller");

router.get("/", controller.getListPage);
router.get("/detail/:id", controller.getDetailPage);
router.get("/edit/:id", controller.getEditPage);

// ✅ LƯU KẾT QUẢ NGHIỆM THU
router.post("/edit/:id", controller.postEditPage);

router.get("/delete/:id", controller.getDeletePage);

module.exports = router;
