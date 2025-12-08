import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js";
import path from "path";

// Detect whether the current Prisma client/model has `publishedAt` field.
// This avoids runtime errors if schema was updated but client/migrations weren't applied.
const newsModelHasPublishedAt = (() => {
  try {
    const model = prisma._dmmf?.modelMap?.NewsEvent;
    if (!model || !Array.isArray(model.fields)) return false;
    return model.fields.some((f) => f.name === "publishedAt");
  } catch (err) {
    return false;
  }
})();

export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.newsEvent.findMany({
        orderBy: { createdAt: "desc" },
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
    const { title, content, category } = req.body;

    if (!title || !content || !category)
      return errorResponse(res, "title, content & category required", 400);

    // handle optional publishedAt (allow scheduling)
    let publishedAt;
    if (req.body.publishedAt !== undefined && req.body.publishedAt !== "") {
      if (!newsModelHasPublishedAt) {
        return errorResponse(res, "publishedAt is not supported by the current Prisma schema. Run migrations and regenerate the Prisma client.", 400);
      }
      const parsed = new Date(req.body.publishedAt);
      if (isNaN(parsed.getTime())) {
        return errorResponse(res, "Invalid publishedAt date format. Use ISO date string.", 400);
      }
      publishedAt = parsed;
    }

    // parse isPublic safely (accept boolean, "true"/"false", "1"/"0")
    let isPublicValue;
    if (req.body.isPublic !== undefined) {
      const raw = req.body.isPublic;
      if (typeof raw === "string") {
        isPublicValue = raw === "true" || raw === "1";
      } else {
        isPublicValue = Boolean(raw);
      }
    }

    // HANDLE IMAGE -> store as imageUrl (Prisma model expects imageUrl)
    let imageUrl = undefined;
    if (req.file) {
      // use posix join to ensure forward-slashes in the URL even on Windows
      const filePath = path.posix.join("news", req.file.filename);
      imageUrl = fileUrl(req, filePath);
    }

    const data = {
      title,
      content,
      category,
      ...(req.body.isPublic !== undefined ? { isPublic: isPublicValue } : {}),
      ...(publishedAt ? { publishedAt } : {}),
      ...(imageUrl ? { imageUrl } : {})
    };

    const item = await prisma.newsEvent.create({ data });

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
    const { title, content, category } = req.body;

    if (Number.isNaN(id)) return errorResponse(res, "Invalid id", 400);

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;

    // parse isPublic for update
    if (req.body.isPublic !== undefined) {
      const raw = req.body.isPublic;
      updateData.isPublic = (typeof raw === "string") ? (raw === "true" || raw === "1") : Boolean(raw);
    }

    // handle optional publishedAt update
    if (req.body.publishedAt !== undefined) {
      if (req.body.publishedAt === null || req.body.publishedAt === "") {
        return errorResponse(res, "To clear publishedAt make it nullable in schema; received empty value", 400);
      }
      const parsed = new Date(req.body.publishedAt);
      if (isNaN(parsed.getTime())) {
        return errorResponse(res, "Invalid publishedAt date format. Use ISO date string.", 400);
      }
      updateData.publishedAt = parsed;
    }

    // image upload -> set imageUrl (use posix join)
    if (req.file) {
      req.uploadFolder = "news";
      const filePath = path.posix.join("news", req.file.filename);
      updateData.imageUrl = fileUrl(req, filePath);
    }

    if (Object.keys(updateData).length === 0) return errorResponse(res, "No updatable fields provided", 400);

    const item = await prisma.newsEvent.update({ where: { id }, data: updateData });

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
