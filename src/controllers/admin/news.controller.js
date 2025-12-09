import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js";
import path from "path";

const newsModelHasPublishedAt = (() => {
  try {
    console.log("fd");

    console.log(prisma._dmmf.modelMap.NewsEvent.fields.map((f) => f.name));
    console.log("f");

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
        take: limit,
      }),
      prisma.newsEvent.count(),
    ]);

    // 💡 Map over the fetched items to process the imageUrls array
    const processedItems = items.map(item => {
      // item.imageUrl is now String[]
      if (item.imageUrl && item.imageUrl.length > 0) {
        // Map each path in the array to its full public URL
        item.imageUrl = item.imageUrl.map(filePath => fileUrl(req, filePath));
      }
      return item;
    });

    return success(res, { items: processedItems, total, page });
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
        return errorResponse(
          res,
          "publishedAt is not supported by the current Prisma schema. Run migrations and regenerate the Prisma client.",
          400
        );
      }
      const parsed = new Date(req.body.publishedAt);
      if (isNaN(parsed.getTime())) {
        return errorResponse(
          res,
          "Invalid publishedAt date format. Use ISO date string.",
          400
        );
      }
      publishedAt = parsed;
    }

    let isPublicValue;
    if (req.body.isPublic !== undefined) {
      const raw = req.body.isPublic;
      if (typeof raw === "string") {
        isPublicValue = raw === "true" || raw === "1";
      } else {
        isPublicValue = Boolean(raw);
      }
    }

let imageUrls = []; 
if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    imageUrls = req.files.map((file) => {
        return path.posix.join("news", file.filename); 
    });
}

const data = {
    title,
    content,
    category,
    ...(req.body.isPublic !== undefined ? { isPublic: isPublicValue } : {}),
    ...(publishedAt ? { publishedAt } : {}),
    // Change imageUrl to imageUrls and ensure it's only included if the array is not empty
    ...(imageUrls.length > 0 ? { imageUrl: imageUrls } : {}),
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

    // 💡 Process the single item's imageUrl array
if (item.imageUrl && item.imageUrl.length > 0) {
    item.imageUrl = item.imageUrl.map(filePath => fileUrl(req, filePath));
}

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
        take: limit,
      }),
      prisma.newsEvent.count({ where: { category } }),
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

    if (req.body.isPublic !== undefined) {
      const raw = req.body.isPublic;
      updateData.isPublic =
        typeof raw === "string" ? raw === "true" || raw === "1" : Boolean(raw);
    }

    // handle optional publishedAt update
    if (req.body.publishedAt !== undefined) {
      if (req.body.publishedAt === null || req.body.publishedAt === "") {
        return errorResponse(
          res,
          "To clear publishedAt make it nullable in schema; received empty value",
          400
        );
      }
      const parsed = new Date(req.body.publishedAt);
      if (isNaN(parsed.getTime())) {
        return errorResponse(
          res,
          "Invalid publishedAt date format. Use ISO date string.",
          400
        );
      }
      updateData.publishedAt = parsed;
    }

    // image upload handling
if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImageUrls = req.files.map((file) => {
        const filePath = path.posix.join("news", file.filename);
        return fileUrl(req, filePath);
    });
    updateData.imageUrl = newImageUrls; 
}

    if (Object.keys(updateData).length === 0)
      return errorResponse(res, "No updatable fields provided", 400);

    const item = await prisma.newsEvent.update({
      where: { id },
      data: updateData,
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
