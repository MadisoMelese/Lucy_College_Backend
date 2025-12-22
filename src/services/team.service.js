import prisma from "../config/database.js";
import { deleteFile } from "../utils/fileUrl.js";
import path from "path";

export const TeamService = {
  async list({ skip = 0, take = 10, isActive, search }) {
    const where = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      prisma.teamMember.count({ where })
    ]);

    return { items, total };
  },

  async getById(id) {
    return await prisma.teamMember.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    try {
      return await prisma.teamMember.create({ 
        data: {
          ...data,
          order: data.order || 0,
          isActive: data.isActive ?? true
        } 
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error("A team member with this email already exists.");
      }
      throw error;
    }
  },

  async update(id, data) {
    try {
      const numericId = Number(id);
      if (data.imageUrl) {
        const oldMember = await prisma.teamMember.findUnique({ 
          where: { id: numericId }, 
          select: { imageUrl: true } 
        });

        if (oldMember?.imageUrl && oldMember.imageUrl !== data.imageUrl) {
          deleteFile(path.join("src/uploads", oldMember.imageUrl));
        }
      }

      return await prisma.teamMember.update({ 
        where: { id: numericId }, 
        data 
      });
    } catch (error) {
      if (error.code === 'P2025') throw new Error("Team member not found.");
      throw error;
    }
  },

  async remove(id) {
    const numericId = Number(id);
    const member = await prisma.teamMember.findUnique({ 
      where: { id: numericId }, 
      select: { imageUrl: true } 
    });

    if (!member) throw new Error("Team member not found.");

    const deleted = await prisma.teamMember.delete({ where: { id: numericId } });

    if (member.imageUrl) {
      deleteFile(path.join("src/uploads", member.imageUrl));
    }

    return deleted;
  }
};