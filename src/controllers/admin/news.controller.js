import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js";
import path from "path";
import fs from "fs/promises"; // 💡 NEW: Import fs/promises for file deletion

// 💡 NEW: Define the base upload path for file deletion
const uploadRoot = path.resolve("src/uploads"); 


const newsModelHasPublishedAt = (() => {
  try {
    const model = prisma._dmmf?.modelMap?.NewsEvent;
    if (!model || !Array.isArray(model.fields)) return false;
    return model.fields.some((f) => f.name === "publishedAt");
  } catch (err) {
    return false;
  }
})();

// --- LIST FUNCTION ---
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

    // ✅ CORRECT: Convert relative paths to full URLs for the response
    const processedItems = items.map((item) => {
      if (item.imageUrl && item.imageUrl.length > 0) {
        item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
      }
      return item;
    });

    return success(res, { items: processedItems, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- CREATE FUNCTION ---
export const create = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category)
      return errorResponse(res, "title, content & category required", 400);

    // ... (publishedAt and isPublic parsing logic is correct) ...
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

    // ✅ CORRECT: Store only relative paths
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
      ...(imageUrls.length > 0 ? { imageUrl: imageUrls } : {}),
    };

    let item = await prisma.newsEvent.create({ data });

    // 💡 FIX: Convert relative paths to full URLs for the creation response
    if (item.imageUrl && item.imageUrl.length > 0) {
      item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
    }

    return created(res, item, "News created");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- GET ONE FUNCTION ---
export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.newsEvent.findUnique({ where: { id } });

    if (!item) return errorResponse(res, "Not found", 404);

    // ✅ CORRECT: Convert relative paths to full URLs for the response
    if (item.imageUrl && item.imageUrl.length > 0) {
      item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
    }

    return success(res, item);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- GET BY CATEGORY FUNCTION ---
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

    // 💡 FIX: Convert relative paths to full URLs for the response
    const processedItems = items.map((item) => {
      if (item.imageUrl && item.imageUrl.length > 0) {
        item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
      }
      return item;
    });

    return success(res, { items: processedItems, total, page, limit });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- UPDATE FUNCTION ---
export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, category } = req.body;

    if (Number.isNaN(id)) return errorResponse(res, "Invalid id", 400);

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;

    // ... (isPublic and publishedAt parsing logic is correct) ...
    if (req.body.isPublic !== undefined) {
      const raw = req.body.isPublic;
      updateData.isPublic =
        typeof raw === "string" ? raw === "true" || raw === "1" : Boolean(raw);
    }

    if (req.body.publishedAt !== undefined) {
      if (req.body.publishedAt === null || req.body.publishedAt === "") {
        updateData.publishedAt = null;
      } else {
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
    }

    // ✅ CORRECT: Store only relative paths for image replacement
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => {
        return path.posix.join("news", file.filename);
      });
      updateData.imageUrl = newImageUrls;
    }

    if (Object.keys(updateData).length === 0)
      return errorResponse(res, "No updatable fields provided", 400);

    let item = await prisma.newsEvent.update({
      where: { id },
      data: updateData,
    });

    // ✅ CORRECT: Convert relative paths to full URLs for the update response
    if (item.imageUrl && item.imageUrl.length > 0) {
      item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
    }

    return success(res, item, "Updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- REMOVE FUNCTION ---
export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. Fetch the item to get the file paths before deletion
    const itemToDelete = await prisma.newsEvent.findUnique({
      where: { id },
      select: { imageUrl: true }, // Only retrieve the imageUrl field
    });

    if (!itemToDelete) {
      return errorResponse(res, "News item not found", 404);
    }

    // 2. Delete the database record
    await prisma.newsEvent.delete({ where: { id } });

    // 3. Delete the physical files ⚠️ CRITICAL FIX ⚠️
    if (itemToDelete.imageUrl && itemToDelete.imageUrl.length > 0) {
      const deletionPromises = itemToDelete.imageUrl.map(async (relativePath) => {
        // Construct the absolute path: uploadRoot/news/filename.jpg
        const absolutePath = path.join(uploadRoot, relativePath);

        try {
          // Asynchronously delete the file
          await fs.unlink(absolutePath);
        } catch (fileError) {
          // Log error but continue (to delete other files)
          console.error(`Failed to delete file ${absolutePath}:`, fileError.message);
        }
      });
      
      // Wait for all file deletion operations to complete
      await Promise.all(deletionPromises);
    }

    return success(res, null, "Deleted");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};