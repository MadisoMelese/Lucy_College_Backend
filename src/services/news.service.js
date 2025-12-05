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

export const getNewsByCategory = async (category, skip, limit) => {
  const where = { category, isPublic: true };

  const [items, total] = await Promise.all([
    prisma.newsEvent.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit
    }),
    prisma.newsEvent.count({ where })
  ]);

  return { items, total };
};


