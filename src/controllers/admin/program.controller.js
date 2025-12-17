import * as ProgramService from "../../services/program.service.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
    try {
        const { limit, skip, page } = parsePagination(req);
        const { items, total } = await ProgramService.findPrograms(skip, limit);
        return success(res, { items, total, page });
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

export const getOne = async (req, res) => {
    try {
        const item = await ProgramService.findProgramById(req.params.id);
        if (!item) return errorResponse(res, "Program not found", 404);
        return success(res, item);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

export const create = async (req, res) => {
    try {
        const { name, departmentCode, description, durationYears } = req.body;
        if (!name || !departmentCode) {
            return errorResponse(res, "Name and departmentCode are required", 400);
        }
        const item = await ProgramService.createProgram({ 
            name, departmentCode, description, durationYears 
        });
        return created(res, item, "Program created");
    } catch (err) {
        if (err.code === "P2002") return errorResponse(res, "Program name already exists", 409);
        return errorResponse(res, err.message);
    }
};

export const update = async (req, res) => {
    try {
        const item = await ProgramService.updateProgram(req.params.id, req.body);
        return success(res, item, "Program updated");
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

export const remove = async (req, res) => {
    try {
        await ProgramService.deleteProgram(req.params.id);
        return success(res, null, "Program deleted");
    } catch (err) {
        if (err.code === "P2003") return errorResponse(res, "Cannot delete program with linked data", 409);
        return errorResponse(res, err.message);
    }
};