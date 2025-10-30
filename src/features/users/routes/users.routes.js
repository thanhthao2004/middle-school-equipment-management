import express from "express";
import * as controller from "../controllers/users.controller.js";

const router = express.Router();

router.get("/create", controller.showCreateForm);
router.post("/create", controller.createUser);

export default router;
