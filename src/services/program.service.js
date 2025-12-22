// import prisma from "../config/database.js";

// // program.service.js
// export const findPrograms = async (skip, limit) => {
//     const items = await prisma.program.findMany({
//         skip,
//         take: limit,
//         include: {
//             department: true,
//             _count: {
//                 select: {
//                     curriculum: true, // This now matches the cleaned schema
//                     feeStructures: true
//                 }
//             }
//         },
//         orderBy: { name: "asc" },
//     });
//     const total = await prisma.program.count();
//     return { items, total };
// };

// export const findProgramById = async (id) => {
//     return await prisma.program.findUnique({
//         where: { id: parseInt(id) },
//         include: {
//             department: true,
//             courses: {
//                 include: { course: true }
//             }
//         }
//     });
// };

// export const createProgram = async (data) => {
//     // Ensure the department exists first
//     const dept = await prisma.department.findUnique({
//         where: { departmentCode: data.departmentCode.toUpperCase() }
//     });

//     if (!dept) throw new Error(`Department ${data.departmentCode} not found`);

//     return await prisma.program.create({
//         data: {
//             ...data,
//             departmentCode: data.departmentCode.toUpperCase()
//         }
//     });
// };

// export const updateProgram = async (id, data) => {
//     if (data.departmentCode) {
//         data.departmentCode = data.departmentCode.toUpperCase();
//     }
//     return await prisma.program.update({
//         where: { id: parseInt(id) },
//         data
//     });
// };

// export const deleteProgram = async (id) => {
//     return await prisma.program.delete({
//         where: { id: parseInt(id) }
//     });
// };

import prisma from "../config/database.js";

/**
 * Find all programs with advanced filtering and pagination
 */
export const findPrograms = async (skip, limit, filters = {}) => {
  const { departmentCode, programType, deliveryMode, search } = filters;

  // Dynamically build the where clause
  const where = {};
  if (departmentCode) where.departmentCode = departmentCode.toUpperCase();
  if (programType) where.programType = programType.toUpperCase();
  if (deliveryMode) where.deliveryMode = deliveryMode.toUpperCase();
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [items, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip,
      take: limit,
      include: {
        department: {
          select: { name: true, facultyCode: true },
        },
        _count: {
          select: { curriculum: true }, // Counts courses in the curriculum
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.program.count({ where }),
  ]);

  return { items, total };
};

export const findProgramById = async (id) => {
  return await prisma.program.findUnique({
    where: { id: parseInt(id) },
    include: {
      department: true,
      curriculum: {
        include: { course: true },
      },
    },
  });
};

export const findProgramByDepartmentCode = async (departmentCode) => {
  return await prisma.program.findMany({
    where: { departmentCode: departmentCode.toUpperCase() },
    include: {
      department: true,
      curriculum: { include: { course: true } },
    },
  });
};
/**
 * Create a new program with Enum validation
 */
export const createProgram = async (payload) => {
  // 1. Verify Department exists
  const dept = await prisma.department.findUnique({
    where: { departmentCode: payload.departmentCode.toUpperCase() },
  });
  if (!dept)
    throw new Error(
      `Department Code '${payload.departmentCode}' does not exist.`
    );

  // 2. Data persistence
  return await prisma.program.create({
    data: {
      name: payload.name,
      description: payload.description,
      durationYears: parseInt(payload.durationYears) || 4,
      departmentCode: payload.departmentCode.toUpperCase(),
      // Ensure enums are uppercase to match Prisma Schema
      deliveryMode: payload.deliveryMode?.toUpperCase() || "REGULAR",
      programType: payload.programType?.toUpperCase() || "DEGREE",
    },
    include: { department: true },
  });
};

/**
 * Update existing program
 */
export const updateProgram = async (id, updateData) => {
  // Prepare data for update (handle upper-casing for enums/codes)
  const data = { ...updateData };
  if (data.departmentCode)
    data.departmentCode = data.departmentCode.toUpperCase();
  if (data.deliveryMode) data.deliveryMode = data.deliveryMode.toUpperCase();
  if (data.programType) data.programType = data.programType.toUpperCase();
  if (data.durationYears) data.durationYears = parseInt(data.durationYears);

  return await prisma.program.update({
    where: { id: parseInt(id) },
    data,
    include: { department: true },
  });
};

export const deleteProgram = async (id) => {
  return await prisma.program.delete({
    where: { id: parseInt(id) },
  });
};
