import prisma from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const registerUser = async ({ email, password, role = "STUDENT" }) => {
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashed, role }
  });
  return user;
};

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

export const verifyCredentials = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await comparePassword(password, user.password);
  if (!ok) return null;
  return user;
};

export const createAccessToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
