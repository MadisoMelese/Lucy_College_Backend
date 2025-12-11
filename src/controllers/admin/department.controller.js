import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import * as DepartmentService from "../../services/department.service.js";

export const list = async (req, res) => {
    try {
        const { limit, skip, page } = parsePagination(req);
        const { items, total } = await DepartmentService.findDepartments(skip, limit);
        return success(res, { items, total, page });
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

export const create = async (req, res) => {
    try {
        const { name, facultyCode, departmentCode } = req.body; 
        
        if (!name || !facultyCode) 
            return errorResponse(res, "Name and facultyCode required", 400);

        const dep = await DepartmentService.createDepartment(name, facultyCode, departmentCode);
        
        return created(res, dep, "Department created");
    } catch (err) {
        if (err.code === "P2002")
            return errorResponse(res, "Department name or code must be unique", 409);
        
        if (err.message.includes("Faculty with code") || err.message.includes("already exists"))
            return errorResponse(res, err.message, 409);

        return errorResponse(res, err.message);
    }
};

// --- GET ONE (by departmentCode) ---
export const getOne = async (req, res) => {
    try {
        const departmentCode = req.params.departmentCode; 
        
        const dep = await DepartmentService.findDepartmentByCode(departmentCode);
        
        if (!dep) return errorResponse(res, "Not found", 404);
        return success(res, dep);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

export const update = async (req, res) => {
    try {
        const existingDepartmentCode = req.params.departmentCode;
        const { name, facultyCode, departmentCode: newDepartmentCode } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (facultyCode !== undefined) updateData.facultyCode = facultyCode;
        if (newDepartmentCode !== undefined) updateData.departmentCode = newDepartmentCode;
        
        const dep = await DepartmentService.updateDepartment(existingDepartmentCode, updateData);
        
        return success(res, dep, "Updated");
    } catch (err) {
        if (err.code === "P2002")
            return errorResponse(res, "Department name or code must be unique", 409);
        if (err.code === "P2025")
            return errorResponse(res, `Department with code ${existingDepartmentCode} not found`, 404);
        if (err.message.includes("Faculty with code"))
            return errorResponse(res, err.message, 404); 
        if (err.message.includes("No updatable fields"))
            return errorResponse(res, err.message, 400);

        return errorResponse(res, err.message);
    }
};

export const remove = async (req, res) => {
    try {
        const departmentCode = req.params.departmentCode; 
        
        await DepartmentService.deleteDepartment(departmentCode);
        
        return success(res, null, "Deleted");
    } catch (err) {
        if (err.code === "P2025") 
            return errorResponse(res, `Department with code ${departmentCode} not found`, 404);
        if (err.code === "P2003")
            return errorResponse(res, "Cannot delete department while it has associated records.", 409);
            
        return errorResponse(res, err.message);
    }
};