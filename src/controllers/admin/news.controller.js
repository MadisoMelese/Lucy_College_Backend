import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js";
import path from "path";
import fs from "fs/promises";
import { Prisma } from "@prisma/client";
const uploadRoot = path.resolve("src/uploads");

const newsModelHasPublishedAt = (() => {
  try {
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.name === "NewsEvent"
    );
    console.log("model", model);

    if (!model) return false;

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

export const create = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category)
      return errorResponse(res, "title, content & category required", 400);
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
      ...(imageUrls.length > 0 ? { imageUrl: imageUrls } : {}),
    };
    let item = await prisma.newsEvent.create({ data });
    if (item.imageUrl && item.imageUrl.length > 0) {
      item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
    }
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
    if (item.imageUrl && item.imageUrl.length > 0) {
      item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
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

    const existingItem = await prisma.newsEvent.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!existingItem) return errorResponse(res, "News item not found", 404);
    const existingImageUrls = existingItem.imageUrl || [];
    let updatedImageUrls = existingImageUrls;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => {
        return path.posix.join("news", file.filename);
      });

      if (req.body.replace_images === "true") {
        const deletionPromises = existingImageUrls.map(async (relativePath) => {
          const absolutePath = path.join(uploadRoot, relativePath);
          try {
            await fs.unlink(absolutePath);
          } catch (fileError) {
            console.error(
              `Failed to delete old file ${absolutePath}:`,
              fileError.message
            );
          }
        });
        await Promise.all(deletionPromises);

        updatedImageUrls = newImageUrls;
      } else {
        updatedImageUrls = [...existingImageUrls, ...newImageUrls];
      }
    }

    if (req.body.clear_images === "true") {
      const deletionPromises = updatedImageUrls.map(async (relativePath) => {
        const absolutePath = path.join(uploadRoot, relativePath);
        try {
          await fs.unlink(absolutePath);
        } catch (fileError) {
          console.error(
            `Failed to delete cleared file ${absolutePath}:`,
            fileError.message
          );
        }
      });
      await Promise.all(deletionPromises);

      updatedImageUrls = [];
    }

    updateData.imageUrl = updatedImageUrls;

    if (Object.keys(updateData).length === 0)
      return errorResponse(res, "No updatable fields provided", 400);

    const item = await prisma.newsEvent.update({
      where: { id },
      data: updateData,
    });

    if (item.imageUrl && item.imageUrl.length > 0) {
      item.imageUrl = item.imageUrl.map((filePath) => fileUrl(req, filePath));
    }

    return success(res, item, "Updated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const itemToDelete = await prisma.newsEvent.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!itemToDelete) {
      return errorResponse(res, "News item not found", 404);
    }
    await prisma.newsEvent.delete({ where: { id } });
    if (itemToDelete.imageUrl && itemToDelete.imageUrl.length > 0) {
      const deletionPromises = itemToDelete.imageUrl.map(
        async (relativePath) => {
          const absolutePath = path.join(uploadRoot, relativePath);

          try {
            await fs.unlink(absolutePath);
          } catch (fileError) {
            // Continue deleting other files even if one fails
            console.error(
              `Failed to delete file ${absolutePath}:`,
              fileError.message
            );
            errorResponse(res, `Failed to delete file ${absolutePath}`);
          }
        }
      );
      await Promise.all(deletionPromises);
    }
    return success(res, null, "Deleted");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
