import { Router } from "express";
import { AboutController } from "../controllers/about.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", AboutController.get);

const adminRoles = ["SUPERADMIN", "REGISTRAR"];
router.post("/", authenticate, roleMiddleware(adminRoles), AboutController.create);
router.put("/:id", authenticate, roleMiddleware(adminRoles), AboutController.update);
router.delete("/:id", authenticate, roleMiddleware(adminRoles), AboutController.delete);

export default router;
