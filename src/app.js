import express from "express";
import cors from "cors";
import websiteRoutes from "./routes/website.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ status: "success", message: "Lucy College API is running" }));

app.use("/api", websiteRoutes);

// 404
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
