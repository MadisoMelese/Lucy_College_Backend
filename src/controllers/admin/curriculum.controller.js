import * as CurriculumService from "../../services/curriculum.service.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";

export const addToCurriculum = async (req, res) => {
  try {
    const { programId, courseId, yearLevel, semester } = req.body;
    if (!programId || !courseId || !yearLevel || !semester) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const data = await CurriculumService.addCourseToProgram(
      programId,
      courseId,
      yearLevel,
      semester
    );
    return created(res, data, "Course added to curriculum");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Course already exists in this program", 409);
    return errorResponse(res, err.message);
  }
};

export const getProgramCurriculum = async (req, res) => {
  try {
    const { programId } = req.params;
    const curriculum = await CurriculumService.getCurriculumByProgram(
      programId
    );
    return success(res, curriculum);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const updateCurriculum = async (req, res) => {
  try {
    const { programId, courseId } = req.params;
    const { yearLevel, semester } = req.body;
    const data = await CurriculumService.updateCourseInCurriculum(
      programId,
      courseId,
      { yearLevel, semester }
    );
    return success(res, data, "Curriculum updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const removeFromCurriculum = async (req, res) => {
  try {
    const { programId, courseId } = req.params;
    await CurriculumService.removeCourseFromProgram(programId, courseId);
    return success(res, null, "Course removed from curriculum");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
