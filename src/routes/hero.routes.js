import { Router } from "express";
import { HeroController } from "../controllers/hero.controller.js";
import { upload } from "../config/multer.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();
const adminRoles = ["SUPERADMIN", "REGISTRAR"];

// configure upload destination
router.use((req, res, next) => {
  req.uploadFolder = "hero";
  next();
});

router.get("/", HeroController.getAll);

router.post(
  "/",
  authenticate,
  roleMiddleware(adminRoles),
  upload.single("image"),
  HeroController.create
);

router.put(
  "/:id",
  authenticate,
  roleMiddleware(adminRoles),
  upload.single("image"),
  HeroController.update
);

router.delete(
  "/:id",
  authenticate,
  roleMiddleware(adminRoles),
  HeroController.delete
);

export default router;
