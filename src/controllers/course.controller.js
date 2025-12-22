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
    const { code } = req.params;
    const course = await CourseService.findCourseByCode(code);

    if (!course) {
      return errorResponse(res, `Course with code '${code}' not found`, 404);
    }

    return success(res, course);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
