import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load("./swagger.yaml");

import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import websiteRoutes from "./routes/website.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import aboutRoutes from "./routes/about.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import teamRoutes from "./routes/team.routes.js";
import homepageRoutes from "./routes/homepage.routes.js";

import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

app.get("/", (req, res) =>
  res.json({ status: "success", message: "Lucy College API is running" })
);

app.use("/api", websiteRoutes);

app.use("/auth", authRoutes);

app.use("/admin", adminRoutes);
app.use("/about", aboutRoutes);

app.use("/hero", heroRoutes);
app.use("/home", homepageRoutes);
app.use("/team", teamRoutes);
app.use("/gallery", galleryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
