import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js";
import path from "path";
import fs from "fs/promises";
import * as FacultyService from "../../services/faculty.service.js";

const uploadRoot = path.resolve("src/uploads");
const UPLOAD_SUBDIR = "faculty_dean";

// --- LIST ALL FACULTIES ---
export const list = async (req, res) => {
    try {
        const { limit, skip, page } = parsePagination(req);
        const { items, total } = await FacultyService.findFaculties(skip, limit);

        const processedItems = items.map(item => {
            if (item.deanImage) {
                item.deanImage = fileUrl(req, item.deanImage);
            }
            return item;
        });

        return success(res, { items: processedItems, total, page });
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

// --- GET ONE FACULTY (by facultyCode) ---
export const getOne = async (req, res) => {
    try {
        const facultyCode = req.params.facultyCode;

        const faculty = await FacultyService.findFacultyByCode(facultyCode);

        if (!faculty) return errorResponse(res, "Not found", 404);
        
        if (faculty.deanImage) {
            faculty.deanImage = fileUrl(req, faculty.deanImage);
        }
        
        return success(res, faculty);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};


// --- CREATE NEW FACULTY ---
export const create = async (req, res) => {
    const deanImageFile = req.files?.deanImage?.[0] || req.file;
    let deanImagePath = null;

    try {
        const { 
            name, 
            facultyCode,
            description = "No description provided",
            deanFullname,
            deanEducationLevel,
            deanMessage
        } = req.body;

        if (!name)
            return errorResponse(res, "Name is required for faculty creation", 400);
        
        if (deanImageFile) {
            deanImagePath = path.posix.join(UPLOAD_SUBDIR, deanImageFile.filename);
        }

        const faculty = await FacultyService.createFaculty(
            name, 
            facultyCode,
            description,
            deanImagePath,
            deanFullname,
            deanEducationLevel,
            deanMessage
        );

        if (faculty.deanImage) {
            faculty.deanImage = fileUrl(req, faculty.deanImage);
        }

        return created(res, faculty, "Faculty created");
    } catch (err) {
        if (deanImageFile) {
             const absolutePath = path.join(uploadRoot, UPLOAD_SUBDIR, deanImageFile.filename);
             fs.unlink(absolutePath).catch(cleanError => {
                 console.error(`Failed to cleanup file on error: ${deanImageFile.filename}`, cleanError.message);
             });
        }
        
        if (err.code === "P2002")
            return errorResponse(
                res,
                "Faculty name or facultyCode must be unique",
                409
            );

        if (err.message.includes("already exists"))
            return errorResponse(res, err.message, 409);

        return errorResponse(res, err.message);
    }
};


// --- UPDATE FACULTY (by facultyCode) ---
export const update = async (req, res) => {
    const existingFacultyCode = req.params.facultyCode;
    const deanImageFile = req.files?.deanImage?.[0] || req.file;

    try {
        const { 
            name, 
            facultyCode: newFacultyCode, 
            description,
            deanFullname,
            deanEducationLevel,
            deanMessage,
            clear_deanImage,
            replace_deanImage
        } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (newFacultyCode !== undefined) updateData.facultyCode = newFacultyCode;
        if (description !== undefined) updateData.description = description;
        if (deanFullname !== undefined) updateData.deanFullname = deanFullname;
        if (deanEducationLevel !== undefined) updateData.deanEducationLevel = deanEducationLevel;
        if (deanMessage !== undefined) updateData.deanMessage = deanMessage;

        const existingFaculty = await FacultyService.findFacultyByCode(existingFacultyCode);
        if (!existingFaculty) return errorResponse(res, "Faculty not found", 404);
        
        let existingImagePath = existingFaculty.deanImage;

        // Clear existing image
        if (clear_deanImage === "true" && existingImagePath) {
            const absolutePath = path.join(uploadRoot, existingImagePath);
            try {
                await fs.unlink(absolutePath);
            } catch (e) {
                console.error(`Failed to delete old image during clear: ${e.message}`);
            }
            updateData.deanImage = null;
            existingImagePath = null;
        }

        // Handle new uploaded image
        if (deanImageFile) {
            const newRelativePath = path.posix.join(UPLOAD_SUBDIR, deanImageFile.filename);
            
            if (replace_deanImage === "true" && existingImagePath) {
                const absolutePath = path.join(uploadRoot, existingImagePath);
                try {
                    await fs.unlink(absolutePath);
                } catch (e) {
                    console.error(`Failed to delete old image during replacement: ${e.message}`);
                }
                updateData.deanImage = newRelativePath;
            } else if (!existingImagePath || replace_deanImage !== "true") {
                updateData.deanImage = newRelativePath;
            }
        }
        
        if (Object.keys(updateData).length === 0)
            return errorResponse(res, "No updatable fields provided", 400);

        const faculty = await FacultyService.updateFacultyByCode(
            existingFacultyCode,
            updateData
        );

        if (faculty.deanImage) {
            faculty.deanImage = fileUrl(req, faculty.deanImage);
        }

        return success(res, faculty, "Updated");
    } catch (err) {
        if (deanImageFile) {
             const absolutePath = path.join(uploadRoot, UPLOAD_SUBDIR, deanImageFile.filename);
             fs.unlink(absolutePath).catch(cleanError => {
                 console.error(`Failed to cleanup file on error: ${deanImageFile.filename}`, cleanError.message);
             });
        }
        
        if (err.code === "P2002")
            return errorResponse(
                res,
                "Faculty name or facultyCode must be unique",
                409
            );
        if (err.code === "P2025")
            return errorResponse(
                res,
                `Faculty with facultyCode ${existingFacultyCode} not found`,
                404
            );

        return errorResponse(res, err.message);
    }
};

// --- DELETE FACULTY (by facultyCode) ---
export const remove = async (req, res) => {
    try {
        const facultyCode = req.params.facultyCode;
        
        const itemToDelete = await FacultyService.findFacultyByCode(facultyCode);
        
        if (!itemToDelete) {
            return errorResponse(res, "Faculty not found", 404);
        }

        await FacultyService.deleteFacultyByCode(facultyCode);

        if (itemToDelete.deanImage) {
            const absolutePath = path.join(uploadRoot, itemToDelete.deanImage);
            try {
                await fs.unlink(absolutePath);
            } catch (fileError) {
                console.error(
                    `Failed to delete Dean image file ${absolutePath}:`,
                    fileError.message
                );
            }
        }
        
        return success(res, null, "Deleted");
    } catch (err) {
        if (err.code === "P2025")
            return errorResponse(
                res,
                `Faculty with facultyCode ${facultyCode} not found`,
                404
            );
        if (err.code === "P2003")
            return errorResponse(
                res,
                "Cannot delete faculty while it has associated departments. Delete departments first.",
                409
            );

        return errorResponse(res, err.message);
    }
};