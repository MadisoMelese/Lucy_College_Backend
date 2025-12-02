import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.department.findMany({ skip, take: limit, include: { courses: true } }),
      prisma.department.count()
    ]);
    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return errorResponse(res, "Name required", 400);
    const dep = await prisma.department.create({ data: { name } });
    return created(res, dep, "Department created");
  } catch (err) {
    if (err.code === "P2002") return errorResponse(res, "Department name must be unique", 409);
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const dep = await prisma.department.findUnique({ where: { id }, include: { courses: true } });
    if (!dep) return errorResponse(res, "Not found", 404);
    return success(res, dep);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const dep = await prisma.department.update({ where: { id }, data: { name } });
    return success(res, dep, "Updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.department.delete({ where: { id } });
    return success(res, null, "Deleted");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
