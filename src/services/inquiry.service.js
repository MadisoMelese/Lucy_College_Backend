import prisma from "../config/database.js";

export const createInquiry = async (data) => {
  return prisma.inquiry.create({ data });
};
