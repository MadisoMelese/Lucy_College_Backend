import { Router } from "express";
import { GalleryController } from "../controllers/gallery.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";


const router = Router();

const setGalleryFolder = (req, res, next) => {
  req.uploadFolder = "gallery";
  next();
};

// Public
router.get("/", GalleryController.list);
router.get("/:id", GalleryController.getOne);

// Admin
const adminRoles = ["SUPERADMIN", "REGISTRAR"];
router.post(
  "/admin",
  authenticate,
  roleMiddleware(adminRoles), setGalleryFolder, upload.single("image"),
  GalleryController.create
);
router.put(
  "/admin/:id",
  authenticate,
  roleMiddleware(adminRoles), setGalleryFolder, upload.single("image"),
  GalleryController.update
);
router.delete(
  "/:id",
  authenticate,
  roleMiddleware(adminRoles),
  GalleryController.remove
);

export default router;
