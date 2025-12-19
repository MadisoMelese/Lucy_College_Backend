import express from "express";
import * as DepartmentController from "../controllers/department.controller.js";
import * as CourseController from "../controllers/course.controller.js";
import * as NewsController from "../controllers/news.controller.js";
import * as InquiryController from "../controllers/inquiry.controller.js";
import * as FacultyController from "../controllers/admin/faculty.controller.js";

const router = express.Router();

// Faculties
router.get("/faculties", FacultyController.list);
router.get("/faculties/:facultyCode", FacultyController.getOne);
// Departments
router.get("/departments", DepartmentController.getAll);
router.get("/:facultyCode/departments", DepartmentController.getByFacultyCode);
router.get("/departments/:id", DepartmentController.getOne);

// Courses
router.get("/courses", CourseController.getAll);
router.get("/courses/:id", CourseController.getOne);

// News
router.get("/news", NewsController.getAll);
router.get("/news/:id", NewsController.getOne);
router.get("/news/category/:category", NewsController.getByCategory);

// Inquiry
router.post("/inquiry", InquiryController.create);

export default router;
