const express = require("express");
const router = express.Router();
const controller = require("../controllers/acceptance.controller");

router.get("/", controller.getListPage.bind(controller));
router.get("/edit/:id", controller.getEditPage.bind(controller));
router.get("/delete/:id", controller.getDeletePage.bind(controller));

module.exports = router;
