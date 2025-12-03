import { Router } from "express";
import { TeamController } from "../controllers/team.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

// Public
router.get("/", TeamController.list);
router.get("/:id", TeamController.getOne);

// Admin
const adminRoles = ["SUPERADMIN", "REGISTRAR"];
router.post("/", authenticate, roleMiddleware(adminRoles), TeamController.create);
router.put("/:id", authenticate, roleMiddleware(adminRoles), TeamController.update);
router.delete("/:id", authenticate, roleMiddleware(adminRoles), TeamController.remove);

export default router;
