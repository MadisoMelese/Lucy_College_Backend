import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js";
import path from "path";

export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.newsEvent.findMany({
        orderBy: { date: "desc" },
        skip,
        take: limit
      }),
      prisma.newsEvent.count()
    ]);

    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


export const create = async (req, res) => {
  try {
    const { title, content, category, isPublic = true } = req.body;

    if (!title || !content || !category)
      return errorResponse(res, "title, content & category required", 400);

    // ⬅️ HANDLE IMAGE
    let image = null;
    if (req.file) {
      image = fileUrl(req, path.join("news", req.file.filename));
    }

    const item = await prisma.newsEvent.create({
      data: { title, content, category, isPublic, image }
    });

    return created(res, item, "News created");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.newsEvent.findUnique({ where: { id } });

    if (!item) return errorResponse(res, "Not found", 404);

    return success(res, item);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


export const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit, skip, page } = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.newsEvent.findMany({
        where: { category },
        skip,
        take: limit
      }),
      prisma.newsEvent.count({ where: { category } })
    ]);

    return success(res, { items, total, page, limit });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, category, isPublic } = req.body;

    let image;
    if (req.file) {
      req.uploadFolder = "news";
      image = fileUrl(req, path.join("news", req.file.filename));
    }

    const item = await prisma.newsEvent.update({
      where: { id },
      data: {
        title,
        content,
        category,
        isPublic,
        ...(image && { image })
      }
    });

    return success(res, item, "Updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.newsEvent.delete({ where: { id } });
    return success(res, null, "Deleted");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
