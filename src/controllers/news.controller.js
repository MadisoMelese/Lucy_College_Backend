import * as NewsService from "../services/news.service.js";
import { success, errorResponse } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

export const getAll = async (req, res) => {
  try {
    const items = await NewsService.getAllNews();
    return success(res, items);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await NewsService.getNewsById(id);
    if (!article) return errorResponse(res, "News article not found", 404);
    return success(res, article);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


export const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit, skip, page } = parsePagination(req);

    const { items, total } = await NewsService.getNewsByCategory(
      category,
      skip,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return success(res, {
      items,
      meta: {
        total,
        limit,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


