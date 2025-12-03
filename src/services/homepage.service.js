import prisma from "../config/database.js";

export const HomepageService = {
  async getOne() {
    // We expect only one homepage row — get first
    return prisma.homepage.findFirst();
  },

  async create(data) {
    return prisma.homepage.create({ data });
  },

  async update(id, data) {
    return prisma.homepage.update({ where: { id: Number(id) }, data });
  },

  async remove(id) {
    return prisma.homepage.delete({ where: { id: Number(id) } });
  }
};
