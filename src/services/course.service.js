import prisma from "../config/database.js";

export const getAllCourses = async () => {
  return prisma.course.findMany({
    include: { department: true }
  });
};

export const getCourseById = async (id) => {
  return prisma.course.findUnique({
    where: { id: Number(id) },
    include: { department: true }
  });
};
