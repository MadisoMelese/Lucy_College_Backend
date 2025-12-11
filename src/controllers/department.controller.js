import * as DeptService from "../services/department.service.js";
import { success, errorResponse } from "../utils/apiResponse.js";

export const getAll = async (req, res) => {
  try {
    const departments = await DeptService.getAllDepartments();
    return success(res, departments);
  } catch (err) {
    return errorResponse(res, err.message);
  } 
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await DeptService.getDepartmentById(id);
    if (!department) return errorResponse(res, "Department not found", 404);
    return success(res, department);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
