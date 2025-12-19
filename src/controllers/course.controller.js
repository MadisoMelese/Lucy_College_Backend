import * as CourseService from "../services/course.service.js";
import { success, errorResponse } from "../utils/apiResponse.js";

export const getAll = async (req, res) => {
  try {
    const courses = await CourseService.findCourses();
    return success(res, courses);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseService.getCourseById(id);
    if (!course) return errorResponse(res, "Course not found", 404);
    return success(res, course);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
