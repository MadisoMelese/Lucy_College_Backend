import { TeamService } from "../services/team.service.js";
import { success, created, errorResponse } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";
import { deleteFile, fileUrl } from "../utils/fileUrl.js";
import { z } from "zod";

const teamSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  order: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return 0;
    const parsed = Number(val);
    return isNaN(parsed) ? 0 : parsed;
  }, z.number().default(0)),
  isActive: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return true;
  }, z.boolean().default(true)),
  social: z.preprocess((val) => {
    if (!val || val === "") return null;
    try {
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch {
      return null;
    }
  }, z.record(z.string()).optional().nullable())
});

const formatZodError = (err) => err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');

export const TeamController = {
  async create(req, res) {
    try {
      const validatedData = teamSchema.parse(req.body);

      if (req.file) {
        const folder = req.uploadFolder || "misc";
        validatedData.imageUrl = `${folder}/${req.file.filename}`;
      }

      const item = await TeamService.create(validatedData);
      
      return created(res, {
        ...item,
        imageUrl: fileUrl(req, item.imageUrl)
      }, "Team member created");
    } catch (err) {
      if (req.file) deleteFile(req.file.path);
      const msg = err instanceof z.ZodError ? formatZodError(err) : err.message;
      return errorResponse(res, msg, 400);
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return errorResponse(res, "Invalid ID", 400);

      const validatedData = teamSchema.partial().parse(req.body);

      if (req.file) {
        const folder = req.uploadFolder || "misc";
        validatedData.imageUrl = `${folder}/${req.file.filename}`;
      }

      const item = await TeamService.update(id, validatedData);
      
      return success(res, {
        ...item,
        imageUrl: fileUrl(req, item.imageUrl)
      }, "Updated successfully");
    } catch (err) {
      if (req.file) deleteFile(req.file.path);
      const msg = err instanceof z.ZodError ? formatZodError(err) : err.message;
      return errorResponse(res, msg, 400);
    }
  },

  async list(req, res) {
    try {
      const { limit, skip, page } = parsePagination(req);
      const isAdmin = req.originalUrl.includes('/admin');
      
      const { items, total } = await TeamService.list({
        skip,
        take: limit,
        isActive: isAdmin ? undefined : true,
        search: req.query.search
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

  async getOne(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return errorResponse(res, "Invalid ID", 400);

      const item = await TeamService.getById(id);
      if (!item) return errorResponse(res, "Not found", 404);
      
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
      await TeamService.remove(req.params.id);
      return success(res, null, "Member deleted successfully");
    } catch (err) {
      const status = err.message === "Team member not found." ? 404 : 400;
      return errorResponse(res, err.message, status);
    }
  }
};