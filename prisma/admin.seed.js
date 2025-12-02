import prisma from "../src/config/database.js";
import { hashPassword } from "../src/utils/hash.js";

const createAdmin = async () => {
  try {
    const email = process.env.SUPERADMIN_EMAIL || "admin@lucy.edu";
    const password = process.env.SUPERADMIN_PASSWORD || "@Lucy123";
    const existing = await prisma.user.findUnique({ where: { email }});
    if (existing) {
      console.log("Superadmin already exists:", email);
      process.exit(0);
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, password: hashed, role: "SUPERADMIN" }});
    console.log("Created SUPERADMIN:", user.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
