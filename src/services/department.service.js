import prisma from "../config/database.js";

export const getAllDepartments = async () => {
  return prisma.department.findMany({
    include: { courses: true }
  });
};

export const getDepartmentById = async (id) => {
  return prisma.department.findUnique({
    where: { id: Number(id) },
    include: { courses: true }
  });
};
