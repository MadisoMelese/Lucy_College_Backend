import { success, created, errorResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/pagination.js";
import { fileUrl } from "../../utils/fileUrl.js"; // <-- ADD THIS IMPORT
import path from "path"; // <-- ADD THIS IMPORT
import fs from "fs/promises"; // <-- ADD THIS IMPORT
import * as DepartmentService from "../../services/department.service.js";

const uploadRoot = path.resolve("src/uploads"); // <-- ADD THIS
const UPLOAD_SUBDIR = "department_head"; // <-- ADD THIS

// --- LIST: Add fileUrl to image if exists (similar to faculty list)
export const list = async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req);
    const { items, total } = await DepartmentService.findDepartments(
      skip,
      limit
    );

    // Add image URL processing
    const processedItems = items.map((item) => {
      if (item.headImage) {
        item.headImage = fileUrl(req, item.headImage);
      }
      return item;
    });

    return success(res, { items: processedItems, total, page });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// --- GET ONE: Add fileUrl to image if exists
export const getOne = async (req, res) => {
  try {
    const departmentCode = req.params.departmentCode;

    const dep = await DepartmentService.findDepartmentByCode(departmentCode);

    if (!dep) return errorResponse(res, "Not found", 404);

    if (dep.headImage) {
      dep.headImage = fileUrl(req, dep.headImage);
    }

    return success(res, dep);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const create = async (req, res) => {
  // Get file info from Multer
  const headImageFile = req.files?.headImage?.[0] || req.file;
  let headImagePath = null;

  try {
    const {
      name,
      facultyCode,
      departmentCode,
      description, // <--- ADDED description to capture optional fields
      headFullname,
      headEducationLevel,
      headMessage,
    } = req.body;

    if (!name || !facultyCode)
      return errorResponse(res, "Name and facultyCode required", 400);

    if (headImageFile) {
      // Build the relative path for database storage
      headImagePath = path.posix.join(UPLOAD_SUBDIR, headImageFile.filename);
    }

    const dep = await DepartmentService.createDepartment(
      name,
      facultyCode,
      departmentCode,
      description, // Pass description
      headImagePath, // Pass image path
      headFullname,
      headEducationLevel,
      headMessage
    );

    if (dep.headImage) {
      dep.headImage = fileUrl(req, dep.headImage);
    }

    return created(res, dep, "Department created");
  } catch (err) {
    if (headImageFile) {
      const absolutePath = path.join(
        uploadRoot,
        UPLOAD_SUBDIR,
        headImageFile.filename
      );
      fs.unlink(absolutePath).catch((cleanError) => {
        console.error(
          `Failed to cleanup file on error: ${headImageFile.filename}`,
          cleanError.message
        );
      });
    }

    if (err.code === "P2002")
      return errorResponse(res, "Department name or code must be unique", 409);

    if (
      err.message.includes("Faculty with code") ||
      err.message.includes("already exists")
    )
      return errorResponse(res, err.message, 409);

    return errorResponse(res, err.message);
  }
};

export const update = async (req, res) => {
  const existingDepartmentCode = req.params.departmentCode;
  const headImageFile = req.files?.headImage?.[0] || req.file;

  try {
    const {
      name,
      facultyCode,
      departmentCode: newDepartmentCode,
      description,
      headFullname,
      headEducationLevel,
      headMessage,
      clear_headImage,
      replace_headImage,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (facultyCode !== undefined) updateData.facultyCode = facultyCode;
    if (newDepartmentCode !== undefined)
      updateData.departmentCode = newDepartmentCode;
    if (description !== undefined) updateData.description = description;
    if (headFullname !== undefined) updateData.headFullname = headFullname;
    if (headEducationLevel !== undefined)
      updateData.headEducationLevel = headEducationLevel;
    if (headMessage !== undefined) updateData.headMessage = headMessage;

    const existingDepartment = await DepartmentService.findDepartmentByCode(
      existingDepartmentCode
    );
    if (!existingDepartment)
      return errorResponse(res, "Department not found", 404);

    let existingImagePath = existingDepartment.headImage;

    if (clear_headImage === "true" && existingImagePath) {
      const absolutePath = path.join(uploadRoot, existingImagePath);
      await fs
        .unlink(absolutePath)
        .catch((e) =>
          console.error(`Failed to delete old image during clear: ${e.message}`)
        );
      updateData.headImage = null;
      existingImagePath = null;
    }

    if (headImageFile) {
      const newRelativePath = path.posix.join(
        UPLOAD_SUBDIR,
        headImageFile.filename
      );

      if (replace_headImage === "true" && existingImagePath) {
        const absolutePath = path.join(uploadRoot, existingImagePath);
        await fs
          .unlink(absolutePath)
          .catch((e) =>
            console.error(
              `Failed to delete old image during replacement: ${e.message}`
            )
          );
        updateData.headImage = newRelativePath;
      } else if (!existingImagePath || replace_headImage !== "true") {
        updateData.headImage = newRelativePath;
      }
    }

    if (Object.keys(updateData).length === 0 && !headImageFile)
      return errorResponse(res, "No updatable fields provided", 400);

    const dep = await DepartmentService.updateDepartment(
      existingDepartmentCode,
      updateData
    );

    if (dep.headImage) {
      dep.headImage = fileUrl(req, dep.headImage);
    }

    return success(res, dep, "Updated");
  } catch (err) {
    if (headImageFile) {
      const absolutePath = path.join(
        uploadRoot,
        UPLOAD_SUBDIR,
        headImageFile.filename
      );
      fs.unlink(absolutePath).catch((cleanError) => {
        console.error(
          `Failed to cleanup file on error: ${headImageFile.filename}`,
          cleanError.message
        );
      });
    }

    if (err.code === "P2002")
      return errorResponse(res, "Department name or code must be unique", 409);
    if (err.code === "P2025")
      return errorResponse(
        res,
        `Department with code ${existingDepartmentCode} not found`,
        404
      );
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

    const itemToDelete = await DepartmentService.findDepartmentByCode(
      departmentCode
    );

    if (!itemToDelete) return errorResponse(res, "Department not found", 404);

    await DepartmentService.deleteDepartment(departmentCode);

    if (itemToDelete.headImage) {
      const absolutePath = path.join(uploadRoot, itemToDelete.headImage);
      await fs.unlink(absolutePath).catch((fileError) => {
        console.error(`Failed to delete Head image file:`, fileError.message);
      });
    }

    return success(res, null, "Deleted");
  } catch (err) {
    if (err.code === "P2025")
      return errorResponse(
        res,
        `Department with code ${departmentCode} not found`,
        404
      );
    if (err.code === "P2003")
      return errorResponse(
        res,
        "Cannot delete department while it has associated records.",
        409
      );

    return errorResponse(res, err.message);
  }
};
