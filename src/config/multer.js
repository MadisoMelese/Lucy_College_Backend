import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload directory
const uploadRoot = path.resolve("src/uploads");

// Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || "misc";
    const uploadPath = path.join(uploadRoot, folder);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

// File Filter (accept images only)
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
