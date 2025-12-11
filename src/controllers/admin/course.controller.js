import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import * as CourseService from "../../services/course.service.js";

export const list = async (req, res) => {
    try {
        const { facultyCode, departmentCode } = req.params;
        const { limit, skip, page } = parsePagination(req);
        
        const { items, total, departmentName } = await CourseService.findCoursesByDepartment(
            facultyCode, 
            departmentCode, 
            skip, 
            limit
        );

        return success(res, { items, total, page, departmentName });
    } catch (err) {
        if (err.message.includes("not found in Faculty code")) {
            return errorResponse(res, err.message, 404);
        }
        return errorResponse(res, err.message);
    }
};

export const create = async (req, res) => {
    try {
        const { facultyCode, departmentCode } = req.params; // Get codes from URL
        const { 
            code, 
            title, 
            credits = 0, 
            description = "", 
            tuitionFee = "0.00" 
        } = req.body;
        
        if (!code || !title) 
            return errorResponse(res, "code and title required in body", 400);

        const numericCredits = Number(credits);
        const numericTuitionFee = Number(tuitionFee);

        const course = await CourseService.createCourse(
            code, 
            title, 
            numericCredits, 
            description, 
            numericTuitionFee, 
            departmentCode 
        );
        return created(res, course, "Course created");
    } catch (err) {
        if (err.code === "P2002") 
            return errorResponse(res, "Course code must be unique", 409);
        if (err.message.includes("Department with code"))
            return errorResponse(res, err.message, 404);
            
        return errorResponse(res, err.message);
    }
};

export const getOne = async (req, res) => {
    try {
        const { code: courseCode } = req.params; // Extract course code from URL
        
        const course = await CourseService.findCourseByCode(courseCode);
        if (!course) return errorResponse(res, "Course not found", 404);
        return success(res, course);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

export const update = async (req, res) => {
    try {
        const { code: existingCourseCode, departmentCode: urlDepartmentCode } = req.params;
        const updateData = req.body;
        
  
        if (updateData.departmentCode && updateData.departmentCode.toUpperCase() === urlDepartmentCode.toUpperCase()) {
            delete updateData.departmentCode; 
        }

        const course = await CourseService.updateCourseByCode(existingCourseCode, updateData);
        return success(res, course, "Updated");
    } catch (err) {
        if (err.code === "P2002") 
            return errorResponse(res, "Course code must be unique", 409);
        if (err.code === "P2025") 
            return errorResponse(res, `Course with code ${existingCourseCode} not found`, 404);
        if (err.message.includes("Department with code"))
            return errorResponse(res, err.message, 404);
        
        return errorResponse(res, err.message);
    }
};
export const remove = async (req, res) => {
    try {
        const { code: courseCode } = req.params;
        await CourseService.deleteCourseByCode(courseCode);
        return success(res, null, "Deleted");
    } catch (err) {
        if (err.code === "P2025") 
            return errorResponse(res, `Course with code ${courseCode} not found`, 404);
        if (err.code === "P2003") 
             return errorResponse(res, "Cannot delete course with active registrations or prerequisites.", 409);
        return errorResponse(res, err.message);
    }
};