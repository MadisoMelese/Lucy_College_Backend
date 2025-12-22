import { TeamService } from "../services/team.service.js";
import { success, created, errorResponse } from "../utils/apiResponse.js";
import { z } from "zod";
import { parsePagination } from "../utils/pagination.js";

const createSchema = z.object({
  fullName: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  imageUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  social: z.record(z.string()).optional(), // object of social links
});

export const TeamController = {
  async list(req, res) {
    try {
      const { limit, skip } = parsePagination(req);
      const items = await TeamService.list({
        skip,
        take: limit,
        onlyActive: true,
      });
      return success(res, items);
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async getOne(req, res) {
    try {
      const item = await TeamService.getById(req.params.id);
      if (!item) return errorResponse(res, "Not found", 404);
      return success(res, item);
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async create(req, res) {
    try {
      const parsed = createSchema.parse(req.body);
      const item = await TeamService.create(parsed);
      return created(res, item, "Team member created");
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async update(req, res) {
    try {
      const parsed = createSchema.partial().parse(req.body);
      const item = await TeamService.update(Number(req.params.id), parsed);
      return success(res, item, "Updated");
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async remove(req, res) {
    try {
      await TeamService.remove(Number(req.params.id));
      return success(res, null, "Deleted");
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },
};
