import { HomepageService } from "../services/homepage.service.js";
import { success, created, errorResponse } from "../utils/apiResponse.js";
import { z } from "zod";

const createSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCtaText: z.string().optional(),
  heroCtaUrl: z.string().url().optional(),
  introText: z.string().optional()
});

export const HomepageController = {
  async get(req, res) {
    try {
      const data = await HomepageService.getOne();
      return success(res, data || null);
    } catch (err) {
      return errorResponse(res, err.message);
    }
  },

  async create(req, res) {
    try {
      const parsed = createSchema.parse(req.body);
      const item = await HomepageService.create(parsed);
      return created(res, item, "Homepage created");
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const parsed = createSchema.partial().parse(req.body);
      const item = await HomepageService.update(Number(id), parsed);
      return success(res, item, "Homepage updated");
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      await HomepageService.remove(Number(id));
      return success(res, null, "Homepage removed");
    } catch (err) {
      return errorResponse(res, err.message);
    }
  }
};
