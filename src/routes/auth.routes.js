import express from "express";
import * as AuthCtrl from "../controllers/auth.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", AuthCtrl.register);
router.post("/login", AuthCtrl.login);
router.post("/logout", authenticate, AuthCtrl.logout);

export default router;
