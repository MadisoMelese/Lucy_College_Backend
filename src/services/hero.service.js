import prisma from "../config/database.js";

export const HeroService = {
  getAll() {
    return prisma.heroSlide.findMany();
  },

  create(data) {
    return prisma.heroSlide.create({ data });
  },

  update(id, data) {
    return prisma.heroSlide.update({
      where: { id },
      data,
    });
  },

  delete(id) {
    return prisma.heroSlide.delete({ where: { id } });
  },
};
