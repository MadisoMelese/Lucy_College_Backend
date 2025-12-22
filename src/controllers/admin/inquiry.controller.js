import prisma from "../../config/database.js";
import { success, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
  try {
    const { skip, limit, page } = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inquiry.count(),
    ]);
    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.inquiry.findUnique({ where: { id } });
    if (!item) return errorResponse(res, "Not found", 404);
    return success(res, item);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const item = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });
    return success(res, item, "Updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.inquiry.delete({ where: { id } });
    return success(res, null, "Deleted");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
