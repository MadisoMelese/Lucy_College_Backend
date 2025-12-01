import app from "./app.js";
import { PORT } from "./config/env.js";
import prisma from "./config/database.js";

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT} (env=${process.env.NODE_ENV})`);
});

// prisma shutdown handler
const shutdown = async () => {
  console.log("Shutting down server...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected. Server closed.");
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    console.error("Forcing shutdown.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
