import prisma from "../config/database.js";

export const AboutService = {
  async getAbout() {
    const about = await prisma.about.findFirst();
    return about;
  },

  async createAbout(data) {
    return await prisma.about.create({ data });
  },

  async updateAbout(id, data) {
    return await prisma.about.update({
      where: { id },
      data,
    });
  },

  async deleteAbout(id) {
    return await prisma.about.delete({
      where: { id },
    });
  },
};
