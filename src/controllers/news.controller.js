import * as NewsService from "../services/news.service.js";
import { success, errorResponse } from "../utils/apiResponse.js";
import { fileUrl } from "../utils/fileUrl.js";
import { parsePagination } from "../utils/pagination.js";

export const getAll = async (req, res) => {
  try {
    const items = await NewsService.getAllNews();

    const processedItems = items.map(item => {
      // item.imageUrl is now String[]
      if (item.imageUrl && item.imageUrl.length > 0) {
        item.imageUrl = item.imageUrl.map(filePath => fileUrl(req, filePath));
      }
      return item;
    });
    return success(res, processedItems);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await NewsService.getNewsById(id);
    if (!article) return errorResponse(res, "News article not found", 404);
    if (article.imageUrl && article.imageUrl.length > 0) {
        article.imageUrl = article.imageUrl.map(filePath => fileUrl(req, filePath));
    }
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
    const processedItems = items.map(item => {
      // item.imageUrl is now String[]
      if (item.imageUrl && item.imageUrl.length > 0) {
        item.imageUrl = item.imageUrl.map(filePath => fileUrl(req, filePath));
      }
      return item;
    });
    const totalPages = Math.ceil(total / limit);

    return success(res, {
      processedItems,
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


