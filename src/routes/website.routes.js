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
router.get("/departments", DepartmentController.getAll);  //fetching departments without any filters
router.get("/:facultyCode/departments", DepartmentController.getByFacultyCode); //fetching departments by faculty code under specific faculty
router.get("/departments/id/:id", DepartmentController.getOneById);  //fetching department by ID
router.get("/departments/code/:departmentCode", DepartmentController.getOne); //fetching department by department code

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
