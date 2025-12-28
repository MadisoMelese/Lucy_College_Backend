import { GalleryService } from "../services/gallery.service.js";
import { success, created, errorResponse } from "../utils/apiResponse.js";
import { deleteFile, fileUrl } from "../utils/fileUrl.js";
import { parsePagination } from "../utils/pagination.js";
import { z } from "zod";

const gallerySchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  category: z.string().default("General"),
  order: z.preprocess((val) => Number(val) || 0, z.number().default(0)),
  isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(true)),
});

const formatZodError = (err) => err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');

export const GalleryController = {
  async list(req, res) {
    try {
      const { limit, skip, page } = parsePagination(req);
      const isAdmin = req.originalUrl.includes('/admin');
      
      const { items, total } = await GalleryService.list({
        skip,
        take: limit,
        category: req.query.category,
        isActive: isAdmin ? undefined : true,
      });

      const formattedItems = items.map(item => ({
        ...item,
        imageUrl: fileUrl(req, item.imageUrl)
      }));

      return success(res, { items: formattedItems, total, page });
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async create(req, res) {
    try {
      if (!req.file) return errorResponse(res, "Image file is required", 400);

      const validatedData = gallerySchema.parse(req.body);
      
      // Use 'gallery' folder as default for the gallery section
      const folder = req.uploadFolder || "gallery";
      validatedData.imageUrl = `${folder}/${req.file.filename}`;

      const item = await GalleryService.create(validatedData);
      
      return created(res, {
        ...item,
        imageUrl: fileUrl(req, item.imageUrl)
      }, "Image added to gallery");
    } catch (err) {
      if (req.file) deleteFile(req.file.path);
      const msg = err instanceof z.ZodError ? formatZodError(err) : err.message;
      return errorResponse(res, msg, 400);
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const validatedData = gallerySchema.partial().parse(req.body);

      if (req.file) {
        const folder = req.uploadFolder || "gallery";
        validatedData.imageUrl = `${folder}/${req.file.filename}`;
      }

      const item = await GalleryService.update(id, validatedData);
      
      return success(res, {
        ...item,
        imageUrl: fileUrl(req, item.imageUrl)
      }, "Gallery item updated");
    } catch (err) {
      if (req.file) deleteFile(req.file.path);
      const msg = err instanceof z.ZodError ? formatZodError(err) : err.message;
      return errorResponse(res, msg, 400);
    }
  },

  async getOne(req, res) {
    try {
      const item = await GalleryService.getById(req.params.id);
      if (!item) return errorResponse(res, "Gallery item not found", 404);
      
      return success(res, {
        ...item,
        imageUrl: fileUrl(req, item.imageUrl)
      });
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async remove(req, res) {
    try {
      await GalleryService.remove(req.params.id);
      return success(res, null, "Deleted successfully");
    } catch (err) {
      return errorResponse(res, err.message, err.message.includes("not found") ? 404 : 400);
    }
  }
};