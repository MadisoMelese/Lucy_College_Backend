import { Router } from "express";
import { TeamController } from "../controllers/team.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";
const setManagementFolder = (req, res, next) => {
  req.uploadFolder = "management";
  next();
};
const router = Router();



// Admin
const adminRoles = ["SUPERADMIN", "REGISTRAR"];

router.get("/admin/list",   authenticate,
  roleMiddleware(adminRoles), TeamController.list);
router.get("/admin/list/:id",   authenticate,
  roleMiddleware(adminRoles), TeamController.getOne);
router.post(
  "/admin",
  authenticate,
  roleMiddleware(adminRoles),
  setManagementFolder,
  upload.single('image'),
  TeamController.create
);
router.put(
  ".admin/:id",
  authenticate,
  roleMiddleware(adminRoles),
  setManagementFolder,
  upload.single('image'),
  TeamController.update
);
router.delete(
  "/admin/:id",
  authenticate,
  roleMiddleware(adminRoles),
  TeamController.remove
);

export default router;
