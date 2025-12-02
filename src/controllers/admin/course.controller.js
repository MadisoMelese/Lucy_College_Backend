import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.course.findMany({ skip, take: limit, include: { department: true } }),
      prisma.course.count()
    ]);
    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const create = async (req, res) => {
  try {
    const { code, title, credits = 0, description = "", tuitionFee = "0.00", departmentId } = req.body;
    if (!code || !title || !departmentId) return errorResponse(res, "code, title, departmentId required", 400);
    const course = await prisma.course.create({
      data: { code, title, credits: Number(credits), description, tuitionFee: Number(tuitionFee), departmentId: Number(departmentId) }
    });
    return created(res, course, "Course created");
  } catch (err) {
    if (err.code === "P2002") return errorResponse(res, "Course code must be unique", 409);
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const course = await prisma.course.findUnique({ where: { id }, include: { department: true } });
    if (!course) return errorResponse(res, "Not found", 404);
    return success(res, course);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    if (data.credits) data.credits = Number(data.credits);
    if (data.tuitionFee) data.tuitionFee = Number(data.tuitionFee);
    const course = await prisma.course.update({ where: { id }, data });
    return success(res, course, "Updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.course.delete({ where: { id } });
    return success(res, null, "Deleted");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
