import * as DeptService from "../services/department.service.js";
import { success, errorResponse } from "../utils/apiResponse.js";
import { fileUrl } from "../utils/fileUrl.js";
import { parsePagination } from "../utils/pagination.js";

export const getAll = async (req, res) => {
  try {
    const departments = await DeptService.findDepartments();
    return success(res, departments);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getByFacultyCode = async (req, res) => {
  try {
    const { facultyCode } = req.params;
    const { limit, skip, page } = parsePagination(req);

    // FIX: Pass all three required arguments
    const { items, total } = await DeptService.findDepartmentByFacultyCode(
      skip,
      limit,
      facultyCode
    );

    // Process images for the departments
    const processedItems = items.map((item) => {
      if (item.headImage) {
        item.headImage = fileUrl(req, item.headImage);
      }
      return item;
    });

    return success(res, { items: processedItems, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getOneById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await DeptService.getDepartmentById(id);
    if (!department) return errorResponse(res, "Department not found", 404);
    return success(res, department);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const departmentCode = req.params.departmentCode;

    const dep = await DeptService.findDepartmentByCode(departmentCode);

    if (!dep) return errorResponse(res, "Not found", 404);

    if (dep.headImage) {
      dep.headImage = fileUrl(req, dep.headImage);
    }

    return success(res, dep);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
