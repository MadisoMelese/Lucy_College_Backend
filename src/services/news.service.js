import prisma from "../config/database.js";

export const getAllNews = async () => {
  return prisma.newsEvent.findMany({
    where: { isPublic: true },
    orderBy: { date: "desc" }
  });
};

export const getNewsById = async (id) => {
  return prisma.newsEvent.findUnique({
    where: { id: Number(id) }
  });
};
