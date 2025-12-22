import * as CourseService from "../../services/course.service.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
  try {
    const { facultyCode, departmentCode } = req.params;
    const { limit, skip, page } = parsePagination(req);

    if (!facultyCode || !departmentCode) {
      return errorResponse(
        res,
        "Faculty and Department codes are required",
        400
      );
    }

    const result = await CourseService.findCoursesByDepartment(
      facultyCode,
      departmentCode,
      skip,
      limit
    );

    return success(
      res,
      {
        ...result,
        page,
        limit,
      },
      `Courses for ${result.departmentName} fetched successfully`
    );
  } catch (err) {
    if (err.message.includes("not found")) {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(
      res,
      "Internal Server Error while fetching courses",
      500
    );
  }
};

export const create = async (req, res) => {
  try {
    const { departmentCode } = req.params;
    const { code, title, credits, tuitionFee } = req.body;

    if (!code || !title || credits === undefined) {
      return errorResponse(
        res,
        "Missing required fields: code, title, or credits",
        400
      );
    }

    const course = await CourseService.createCourse({
      ...req.body,
      departmentCode,
    });

    return created(res, course, "Course registered successfully");
  } catch (err) {
    if (err.code === "P2002") {
      return errorResponse(
        res,
        `A course with code '${req.body.code}' already exists`,
        409
      );
    }
    if (err.message.includes("not found")) {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(res, err.message, 500);
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

export const update = async (req, res) => {
  try {
    const { code } = req.params;

    const updateData = { ...req.body };

    const updatedCourse = await CourseService.updateCourseByCode(
      code,
      updateData
    );
    return success(res, updatedCourse, "Course updated successfully");
  } catch (err) {
    if (err.code === "P2025")
      return errorResponse(res, "Course not found", 404);
    if (err.code === "P2002")
      return errorResponse(res, "New course code is already taken", 409);
    return errorResponse(res, err.message, 500);
  }
};

export const remove = async (req, res) => {
  try {
    const { code } = req.params;
    await CourseService.deleteCourseByCode(code);
    return success(res, null, "Course deleted successfully");
  } catch (err) {
    if (err.code === "P2025")
      return errorResponse(res, "Course not found", 404);

    if (err.code === "P2003") {
      return errorResponse(
        res,
        "Cannot delete: Students are already registered for this course",
        409
      );
    }
    return errorResponse(res, err.message, 500);
  }
};
