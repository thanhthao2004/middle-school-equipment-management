const express = require("express");
const router = express.Router();
const disposalController = require("../controllers/disposal.controller");

// LIST
router.get("/", disposalController.index);

// ADD REPORT
router.get("/add", disposalController.add);

// ADD DEVICES (FORM)
router.get("/add-devices", disposalController.addDevices);

// ADD DEVICES (POST → lưu vào session)
router.post("/add-devices", disposalController.addDevicesPost);

// STORE REPORT
router.post("/", disposalController.store);

// VIEW
router.get("/view/:id", disposalController.view);

// EDIT
router.get("/edit/:id", disposalController.edit);

// UPDATE REPORT
router.post("/edit/:id", disposalController.update);

// DELETE
router.post("/delete/:id", disposalController.delete);

// PRINCIPAL APPROVAL
router.get("/approve", disposalController.approveIndex);
router.post("/approve/:id", disposalController.approveReport);
router.post("/reject/:id", disposalController.rejectReport);

module.exports = router;
