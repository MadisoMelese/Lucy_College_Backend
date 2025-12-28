import prisma from "../config/database.js";
import { deleteFile } from "../utils/fileUrl.js";
import path from "path";

export const GalleryService = {
  async list({ skip = 0, take = 12, category, isActive }) {
    const where = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.galleryImage.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.galleryImage.count({ where })
    ]);

    return { items, total };
  },

  async getById(id) {
    return await prisma.galleryImage.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    return await prisma.galleryImage.create({ data });
  },

  async update(id, data) {
    const numericId = Number(id);
    if (data.imageUrl) {
      const old = await prisma.galleryImage.findUnique({ 
        where: { id: numericId }, 
        select: { imageUrl: true } 
      });
      if (old?.imageUrl && old.imageUrl !== data.imageUrl) {
        deleteFile(path.join("src/uploads", old.imageUrl));
      }
    }
    return await prisma.galleryImage.update({ where: { id: numericId }, data });
  },

  async remove(id) {
    const numericId = Number(id);
    const item = await prisma.galleryImage.findUnique({ 
      where: { id: numericId }, 
      select: { imageUrl: true } 
    });

    if (!item) throw new Error("Gallery item not found.");

    const deleted = await prisma.galleryImage.delete({ where: { id: numericId } });

    if (item.imageUrl) {
      deleteFile(path.join("src/uploads", item.imageUrl));
    }

    return deleted;
  },
};