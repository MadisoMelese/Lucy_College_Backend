import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.faculty.findMany({
        skip,
        take: limit,
        include: { departments: true },
        orderBy: { name: 'asc' }
      }),
      prisma.faculty.count(),
    ]);
    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return errorResponse(res, "Name is required", 400);

    const faculty = await prisma.faculty.create({ 
      data: { name },
    });
    return created(res, faculty, "Faculty created");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Faculty name must be unique", 409);
      
    return errorResponse(res, err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: { departments: true }, 
    });
    if (!faculty) return errorResponse(res, "Not found", 404);
    return success(res, faculty);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    
    if (!name) return errorResponse(res, "Name is required for update", 400);

    const faculty = await prisma.faculty.update({
      where: { id },
      data: { name },
    });
    return success(res, faculty, "Updated");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Faculty name must be unique", 409);
    if (err.code === "P2025") 
        return errorResponse(res, "Faculty not found", 404);

    return errorResponse(res, err.message);
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.faculty.delete({ where: { id } });
    return success(res, null, "Deleted");
  } catch (err) {
    if (err.code === "P2025") 
        return errorResponse(res, "Faculty not found", 404);
   
    if (err.code === "P2003")
        return errorResponse(res, "Cannot delete faculty while it has associated departments.", 409);
        
    return errorResponse(res, err.message);
  }
};