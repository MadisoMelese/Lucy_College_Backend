import prisma from "../config/database.js";

// program.service.js
export const findPrograms = async (skip, limit) => {
    const items = await prisma.program.findMany({
        skip,
        take: limit,
        include: {
            department: true,
            _count: {
                select: { 
                    curriculum: true, // This now matches the cleaned schema
                    feeStructures: true 
                } 
            }
        },
        orderBy: { name: "asc" },
    });
    const total = await prisma.program.count();
    return { items, total };
};

export const findProgramById = async (id) => {
    return await prisma.program.findUnique({
        where: { id: parseInt(id) },
        include: {
            department: true,
            courses: {
                include: { course: true }
            }
        }
    });
};

export const createProgram = async (data) => {
    // Ensure the department exists first
    const dept = await prisma.department.findUnique({
        where: { departmentCode: data.departmentCode.toUpperCase() }
    });

    if (!dept) throw new Error(`Department ${data.departmentCode} not found`);

    return await prisma.program.create({
        data: {
            ...data,
            departmentCode: data.departmentCode.toUpperCase()
        }
    });
};

export const updateProgram = async (id, data) => {
    if (data.departmentCode) {
        data.departmentCode = data.departmentCode.toUpperCase();
    }
    return await prisma.program.update({
        where: { id: parseInt(id) },
        data
    });
};

export const deleteProgram = async (id) => {
    return await prisma.program.delete({
        where: { id: parseInt(id) }
    });
};