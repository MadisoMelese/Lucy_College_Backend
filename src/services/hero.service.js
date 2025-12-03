import prisma from "../config/database.js";

export const HeroService = {
  getAll() {
    return prisma.heroSlider.findMany();
  },

  create(data) {
    return prisma.heroSlider.create({ data });
  },

  update(id, data) {
    return prisma.heroSlider.update({
      where: { id },
      data,
    });
  },

  delete(id) {
    return prisma.heroSlider.delete({ where: { id } });
  }
};
