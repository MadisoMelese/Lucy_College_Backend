import prisma from "../config/database.js";

export const GalleryService = {
  async list({ skip = 0, take = 12, category, onlyActive = true } = {}) {
    const where = {};
    if (onlyActive) where.isActive = true;
    if (category) where.category = category;
    return prisma.galleryImage.findMany({
      where,
      orderBy: { order: "asc" },
      skip,
      take,
    });
  },

  async getById(id) {
    return prisma.galleryImage.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    return prisma.galleryImage.create({ data });
  },

  async update(id, data) {
    return prisma.galleryImage.update({ where: { id: Number(id) }, data });
  },

  async remove(id) {
    return prisma.galleryImage.delete({ where: { id: Number(id) } });
  },
};
