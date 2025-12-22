import { GalleryService } from "../services/gallery.service.js";
import { success, created, errorResponse } from "../utils/apiResponse.js";
import { z } from "zod";
import { parsePagination } from "../utils/pagination.js";

const createSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  imageUrl: z.string().url(),
  category: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const GalleryController = {
  async list(req, res) {
    try {
      const { limit, skip } = parsePagination(req);
      const category = req.query.category;
      const items = await GalleryService.list({
        skip,
        take: limit,
        category,
        onlyActive: true,
      });
      return success(res, items);
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async getOne(req, res) {
    try {
      const item = await GalleryService.getById(req.params.id);
      if (!item) return errorResponse(res, "Not found", 404);
      return success(res, item);
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async create(req, res) {
    try {
      const parsed = createSchema.parse(req.body);
      const item = await GalleryService.create(parsed);
      return created(res, item, "Gallery image created");
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async update(req, res) {
    try {
      const parsed = createSchema.partial().parse(req.body);
      const item = await GalleryService.update(Number(req.params.id), parsed);
      return success(res, item, "Updated");
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async remove(req, res) {
    try {
      await GalleryService.remove(Number(req.params.id));
      return success(res, null, "Deleted");
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },
};
