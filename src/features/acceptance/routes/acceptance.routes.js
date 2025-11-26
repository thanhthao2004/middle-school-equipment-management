const express = require("express");
const router = express.Router();
const controller = require("../controllers/acceptance.controller");

router.get("/", controller.getListPage.bind(controller));
router.get("/detail/:id", controller.getEditPage.bind(controller)); // Use edit page for detail view
router.get("/edit/:id", controller.getEditPage.bind(controller));
router.get("/delete/:id", controller.getDeletePage.bind(controller));

// POST routes for CRUD operations
router.post("/edit/:id", (req, res) => {
  // TODO: Implement update acceptance logic
  // For now, just redirect back to list
  res.redirect("/manager/acceptance");
});

router.post("/delete/:id", (req, res) => {
  // TODO: Implement delete acceptance item logic
  // For now, just redirect back to list
  res.redirect("/manager/acceptance");
});

module.exports = router;
