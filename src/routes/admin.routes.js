import express from "express";
import authenticate from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";
import * as NewsCtrl from "../controllers/admin/news.controller.js";
import * as DeptCtrl from "../controllers/admin/department.controller.js";
import * as CourseCtrl from "../controllers/admin/course.controller.js";
import * as InquiryCtrl from "../controllers/admin/inquiry.controller.js";
import * as FacultyCtrl from '../controllers/admin/faculty.controller.js';
const router = express.Router();

// require authentication + role for admin routes
const adminOnly = [ "SUPERADMIN", "REGISTRAR" ];
const deanImageUpload = upload.fields([{ name: 'deanImage', maxCount: 1 }]);
const headImageUpload = upload.fields([{ name: 'headImage', maxCount: 1 }]);
// router.use((req, res, next) => {
//   req.uploadFolder = "news";
//   next();
// });

const setNewsFolder = (req, res, next) => {
    req.uploadFolder = "news";
    next();
};

const setFacultyFolder = (req, res, next) => {
    // This must match the UPLOAD_SUBDIR in your controller
    req.uploadFolder = "faculty_dean"; 
    next();
};
const setDepartmentFolder = (req, res, next) => {
    // This must match the UPLOAD_SUBDIR in your controller
    req.uploadFolder = "department_head"; 
    next();
};
// News (CRUD)
router.get("/news", authenticate, roleMiddleware(adminOnly), NewsCtrl.list);
router.post("/news", authenticate, roleMiddleware(adminOnly), setNewsFolder, upload.array('images', 10), NewsCtrl.create);
router.get("/news/:id", authenticate, roleMiddleware(adminOnly), NewsCtrl.getOne);
router.get("/news/category/:category", authenticate, roleMiddleware(adminOnly), NewsCtrl.getNewsByCategory);
router.put("/news/:id", authenticate, roleMiddleware(adminOnly), setNewsFolder, upload.array('images', 10), NewsCtrl.update);
router.delete("/news/:id", authenticate, roleMiddleware(adminOnly), NewsCtrl.remove);

// faculties
router.get("/faculties", authenticate, roleMiddleware(adminOnly), FacultyCtrl.list);
router.post("/faculties", authenticate, roleMiddleware(adminOnly), setFacultyFolder, deanImageUpload, FacultyCtrl.create);
router.get("/faculties/:facultyCode", authenticate, roleMiddleware(adminOnly), FacultyCtrl.getOne);
router.put("/faculties/:facultyCode", authenticate, roleMiddleware(adminOnly), setFacultyFolder, deanImageUpload, FacultyCtrl.update);
router.delete("/faculties/:facultyCode", authenticate, roleMiddleware(adminOnly), FacultyCtrl.remove);
// Departments
router.get("/departments", authenticate, roleMiddleware(adminOnly), DeptCtrl.list);
router.post("/departments", authenticate, roleMiddleware(adminOnly), setDepartmentFolder, headImageUpload, DeptCtrl.create);
router.get("/departments/:departmentCode", authenticate, roleMiddleware(adminOnly), DeptCtrl.getOne);
router.put("/departments/:departmentCode", authenticate, roleMiddleware(adminOnly), setDepartmentFolder, headImageUpload, DeptCtrl.update);
router.delete("/departments/:departmentCode", authenticate, roleMiddleware(adminOnly), DeptCtrl.remove);

// Courses
router.get("/:facultyCode/:departmentCode/courses", authenticate, roleMiddleware(adminOnly), CourseCtrl.list);
router.post("/:facultyCode/:departmentCode/courses", authenticate, roleMiddleware(adminOnly), CourseCtrl.create);
router.get("/:facultyCode/:departmentCode/courses/:code", authenticate, roleMiddleware(adminOnly), CourseCtrl.getOne);
router.put("/:facultyCode/:departmentCode/courses/:code", authenticate, roleMiddleware(adminOnly), CourseCtrl.update);
router.delete("/:facultyCode/:departmentCode/courses/:code", authenticate, roleMiddleware(adminOnly), CourseCtrl.remove);

// Inquiries
router.get("/inquiries", authenticate, roleMiddleware(adminOnly), InquiryCtrl.list);
router.get("/inquiries/:id", authenticate, roleMiddleware(adminOnly), InquiryCtrl.getOne);
router.put("/inquiries/:id", authenticate, roleMiddleware(adminOnly), InquiryCtrl.update);
router.delete("/inquiries/:id", authenticate, roleMiddleware(adminOnly), InquiryCtrl.remove);

export default router;
