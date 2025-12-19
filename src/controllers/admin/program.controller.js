// import * as ProgramService from "../../services/program.service.js";
// import { success, created, errorResponse } from "../../utils/apiResponse.js";
// import { parsePagination } from "../../utils/pagination.js";

// export const list = async (req, res) => {
//   try {
//     const { limit, skip, page } = parsePagination(req);
//     const { items, total } = await ProgramService.findPrograms(skip, limit);
//     return success(res, { items, total, page });
//   } catch (err) {
//     return errorResponse(res, err.message);
//   }
// };

// export const getOne = async (req, res) => {
//   try {
//     const item = await ProgramService.findProgramById(req.params.id);
//     if (!item) return errorResponse(res, "Program not found", 404);
//     return success(res, item);
//   } catch (err) {
//     return errorResponse(res, err.message);
//   }
// };

// export const create = async (req, res) => {
//   try {
//     const { name, departmentCode, description, durationYears } = req.body;
//     if (!name || !departmentCode) {
//       return errorResponse(res, "Name and departmentCode are required", 400);
//     }
//     const item = await ProgramService.createProgram({
//       name,
//       departmentCode,
//       description,
//       durationYears,
//     });
//     return created(res, item, "Program created");
//   } catch (err) {
//     if (err.code === "P2002")
//       return errorResponse(res, "Program name already exists", 409);
//     return errorResponse(res, err.message);
//   }
// };

// export const update = async (req, res) => {
//   try {
//     const item = await ProgramService.updateProgram(req.params.id, req.body);
//     return success(res, item, "Program updated");
//   } catch (err) {
//     return errorResponse(res, err.message);
//   }
// };

// export const remove = async (req, res) => {
//   try {
//     await ProgramService.deleteProgram(req.params.id);
//     return success(res, null, "Program deleted");
//   } catch (err) {
//     if (err.code === "P2003")
//       return errorResponse(res, "Cannot delete program with linked data", 409);
//     return errorResponse(res, err.message);
//   }
// };

import * as ProgramService from "../../services/program.service.js";
import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";

export const list = async (req, res) => {
    try {
        const { limit, skip, page } = parsePagination(req);
        
        // Extract filters from query params
        const filters = {
            departmentCode: req.query.departmentCode,
            programType: req.query.programType,
            deliveryMode: req.query.deliveryMode,
            search: req.query.search
        };

        const { items, total } = await ProgramService.findPrograms(skip, limit, filters);
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
        const item = await ProgramService.createProgram(req.body);
        return created(res, item, "Program created successfully");
    } catch (err) {
        // Handle Prisma Unique constraint error (P2002)
        if (err.code === "P2002") return errorResponse(res, "Program name already exists", 409);
        
        // Handle Invalid Enum values (P2003 or generic Prisma error)
        if (err.message.includes("Invalid value for enum")) {
            return errorResponse(res, "Invalid Program Type or Delivery Mode provided", 400);
        }

        return errorResponse(res, err.message);
    }
};

export const update = async (req, res) => {
    try {
        const item = await ProgramService.updateProgram(req.params.id, req.body);
        return success(res, item, "Program updated successfully");
    } catch (err) {
        if (err.code === "P2025") return errorResponse(res, "Program not found", 404);
        return errorResponse(res, err.message);
    }
};

export const remove = async (req, res) => {
    try {
        await ProgramService.deleteProgram(req.params.id);
        return success(res, null, "Program deleted successfully");
    } catch (err) {
        if (err.code === "P2025") return errorResponse(res, "Program not found", 404);
        if (err.code === "P2003") return errorResponse(res, "Cannot delete program; it has linked curriculum or students.", 409);
        return errorResponse(res, err.message);
    }
};
