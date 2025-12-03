import { Router } from "express";
import { HomepageController } from "../controllers/homepage.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

// Public
router.get("/", HomepageController.get);

// Admin routes (only SUPERADMIN, REGISTRAR)
const adminRoles = ["SUPERADMIN", "REGISTRAR"];
router.post("/", authenticate, roleMiddleware(adminRoles), HomepageController.create);
router.put("/:id", authenticate, roleMiddleware(adminRoles), HomepageController.update);
router.delete("/:id", authenticate, roleMiddleware(adminRoles), HomepageController.remove);

export default router;
