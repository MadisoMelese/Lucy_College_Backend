import prisma from "../../config/database.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

// --- LIST ALL DEPARTMENTS ---
export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.department.findMany({
        skip,
        take: limit,
        // ✅ Enhancement: Include Faculty, Programs, Lecturers, and Courses
        include: { 
          faculty: true,
          programs: true,
          lecturers: true,
          courses: true 
        },
        orderBy: { name: 'asc' } // Optional: Order alphabetically
      }),
      prisma.department.count(),
    ]);
    return success(res, { items, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- CREATE NEW DEPARTMENT ---
export const create = async (req, res) => {
  try {
    const { name, facultyId } = req.body;
    if (!name || !facultyId) return errorResponse(res, "Name and facultyId required", 400);
    
    // Check if the Faculty exists (optional, but good for validation)
    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
        return errorResponse(res, `Faculty with ID ${facultyId} not found.`, 404);
    }
    
    const dep = await prisma.department.create({ 
      data: { name, facultyId },
      // ✅ Enhancement: Include Faculty details in the creation response
      include: { faculty: true } 
    });
    return created(res, dep, "Department created");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Department name must be unique", 409);
    // P2003 is for foreign key constraint fail (if facultyId doesn't exist)
    if (err.code === "P2003") 
        return errorResponse(res, `Invalid facultyId: ${facultyId}`, 400); 

    return errorResponse(res, err.message);
  }
};

// --- GET ONE DEPARTMENT ---
export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const dep = await prisma.department.findUnique({
      where: { id },
      // ✅ Enhancement: Include all relevant relationships
      include: { 
        faculty: true, 
        programs: true, 
        lecturers: true, 
        courses: true 
      },
    });
    if (!dep) return errorResponse(res, "Not found", 404);
    return success(res, dep);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- UPDATE DEPARTMENT ---
export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    // ✅ Change: Destructure facultyId from req.body to allow updating faculty
    const { name, facultyId } = req.body; 

    // Build update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (facultyId !== undefined) updateData.facultyId = facultyId;

    if (Object.keys(updateData).length === 0)
        return errorResponse(res, "No updatable fields provided", 400);

    const dep = await prisma.department.update({
      where: { id },
      data: updateData,
      // ✅ Enhancement: Include Faculty in response to confirm relationship change
      include: { faculty: true } 
    });
    return success(res, dep, "Updated");
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse(res, "Department name must be unique", 409);
    if (err.code === "P2025") // P2025: Record to update not found (i.e., department ID not found)
        return errorResponse(res, "Department not found", 404);
    if (err.code === "P2003") // P2003: Foreign key constraint fail (i.e., facultyId not found)
        return errorResponse(res, `Invalid facultyId provided`, 400);
        
    return errorResponse(res, err.message);
  }
};

// --- DELETE DEPARTMENT ---
export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.department.delete({ where: { id } });
    return success(res, null, "Deleted");
  } catch (err) {
    if (err.code === "P2025") // P2025: Record to delete not found
        return errorResponse(res, "Department not found", 404);
    return errorResponse(res, err.message);
  }
};