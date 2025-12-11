import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import * as DepartmentService from "../../services/department.service.js";

export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);

    const { items, total } = await DepartmentService.findDepartments(
      skip,
      limit
    );

    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const create = async (req, res) => {
  try {
    const { name, facultyId } = req.body;
    if (!name || facultyId === undefined)
      return errorResponse(res, "Name and facultyId required", 400);

    const dep = await DepartmentService.createDepartment(
      name,
      Number(facultyId)
    );

    return created(res, dep, "Department created");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Department name must be unique", 409);

    if (err.message.includes("Faculty with ID") || err.code === "P2003")
      return errorResponse(
        res,
        `Invalid facultyId: ${req.body.facultyId}`,
        400
      );

    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return errorResponse(res, "Invalid department ID format", 400);

    const dep = await DepartmentService.findDepartmentById(id);

    if (!dep) return errorResponse(res, "Not found", 404);
    return success(res, dep);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return errorResponse(res, "Invalid department ID format", 400);

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.facultyId !== undefined)
      updateData.facultyId = Number(req.body.facultyId);

    const dep = await DepartmentService.updateDepartment(id, updateData);

    return success(res, dep, "Updated");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Department name must be unique", 409);
    if (err.code === "P2025")
      return errorResponse(res, "Department not found", 404);
    if (err.message.includes("No updatable fields"))
      return errorResponse(res, err.message, 400);
    if (err.code === "P2003")
      return errorResponse(res, `Invalid facultyId provided`, 400);

    return errorResponse(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return errorResponse(res, "Invalid department ID format", 400);

    await DepartmentService.deleteDepartment(id);

    return success(res, null, "Deleted");
  } catch (err) {
    if (err.code === "P2025")
      return errorResponse(res, "Department not found", 404);

    if (err.code === "P2003")
      return errorResponse(
        res,
        "Cannot delete department with active programs, courses, or lecturers.",
        409
      );

    return errorResponse(res, err.message);
  }
};
