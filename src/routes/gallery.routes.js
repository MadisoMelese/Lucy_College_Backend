import { Router } from "express";
import { GalleryController } from "../controllers/gallery.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

// Public
router.get("/", GalleryController.list);
router.get("/:id", GalleryController.getOne);

// Admin
const adminRoles = ["SUPERADMIN", "REGISTRAR"];
router.post("/", authenticate, roleMiddleware(adminRoles), GalleryController.create);
router.put("/:id", authenticate, roleMiddleware(adminRoles), GalleryController.update);
router.delete("/:id", authenticate, roleMiddleware(adminRoles), GalleryController.remove);

export default router;
