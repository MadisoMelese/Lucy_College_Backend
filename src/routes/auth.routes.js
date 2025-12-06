import express from "express";
import * as AuthCtrl from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", AuthCtrl.register);
router.post("/login", AuthCtrl.login);
router.post("/logout", AuthCtrl.logout);

export default router;
