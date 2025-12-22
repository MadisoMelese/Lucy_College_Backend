import prisma from "../config/database.js";

export const TeamService = {
  async list({ skip = 0, take = 12, onlyActive = true } = {}) {
    const where = {};
    if (onlyActive) where.isActive = true;
    return prisma.teamMember.findMany({
      where,
      orderBy: { order: "asc" },
      skip,
      take,
    });
  },

  async getById(id) {
    return prisma.teamMember.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    return prisma.teamMember.create({ data });
  },

  async update(id, data) {
    return prisma.teamMember.update({ where: { id: Number(id) }, data });
  },

  async remove(id) {
    return prisma.teamMember.delete({ where: { id: Number(id) } });
  },
};
