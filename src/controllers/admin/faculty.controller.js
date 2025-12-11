import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import * as FacultyService from "../../services/faculty.service.js";

// --- LIST ALL FACULTIES ---
export const list = async (req, res) => {
    try {
        const { limit, skip, page } = parsePagination(req);
        const { items, total } = await FacultyService.findFaculties(skip, limit);
        return success(res, { items, total, page });
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

// --- CREATE NEW FACULTY ---
export const create = async (req, res) => {
    try {
        const { name, facultyCode } = req.body; 
        
        if (!name) return errorResponse(res, "Name is required for faculty creation", 400);

        const faculty = await FacultyService.createFaculty(name, facultyCode); 
        
        return created(res, faculty, "Faculty created");
    } catch (err) {
        if (err.code === "P2002")
            return errorResponse(res, "Faculty name or facultyCode must be unique", 409);
            
        if (err.message.includes("already exists"))
            return errorResponse(res, err.message, 409); 

        return errorResponse(res, err.message);
    }
};

// --- GET ONE FACULTY (by facultyCode) ---
export const getOne = async (req, res) => {
    try {
        const facultyCode = req.params.facultyCode; 
        
        const faculty = await FacultyService.findFacultyByCode(facultyCode);
        
        if (!faculty) return errorResponse(res, "Not found", 404);
        return success(res, faculty);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

// --- UPDATE FACULTY (by facultyCode) ---
export const update = async (req, res) => {
    try {
        const existingFacultyCode = req.params.facultyCode; 
        const { name, facultyCode: newFacultyCode } = req.body; 
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (newFacultyCode !== undefined) updateData.facultyCode = newFacultyCode; 

        if (Object.keys(updateData).length === 0)
            return errorResponse(res, "No updatable fields provided", 400);

        const faculty = await FacultyService.updateFacultyByCode(existingFacultyCode, updateData);
        return success(res, faculty, "Updated");
    } catch (err) {
        if (err.code === "P2002")
            return errorResponse(res, "Faculty name or facultyCode must be unique", 409);
        if (err.code === "P2025")
            return errorResponse(res, `Faculty with facultyCode ${existingFacultyCode} not found`, 404);

        return errorResponse(res, err.message);
    }
};

// --- DELETE FACULTY (by facultyCode) ---
export const remove = async (req, res) => {
    try {
        const facultyCode = req.params.facultyCode; 
        
        await FacultyService.deleteFacultyByCode(facultyCode);
        
        return success(res, null, "Deleted");
    } catch (err) {
        if (err.code === "P2025") 
            return errorResponse(res, `Faculty with facultyCode ${facultyCode} not found`, 404);
        if (err.code === "P2003")
            return errorResponse(res, "Cannot delete faculty while it has associated departments. Delete departments first.", 409);
            
        return errorResponse(res, err.message);
    }
};