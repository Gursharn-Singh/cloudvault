import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();

const app = express();

// ✅ Fix __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Absolute uploads path
const uploadsPath = path.join(__dirname, "uploads");

// ✅ Ensure uploads folder exists (IMPORTANT for Render)
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// ✅ Debug log (VERY IMPORTANT)
console.log("Serving uploads from:", uploadsPath);

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Static file serving (FIXED)
app.use("/uploads", express.static(uploadsPath));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// ✅ Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted ✅",
    userId: req.userId
  });
});

// ✅ Root test
app.get("/", (req, res) => {
  res.send("CloudVault backend running 🚀");
});

// ✅ DEBUG: check uploads folder
app.get("/check-uploads", (req, res) => {
  if (!fs.existsSync(uploadsPath)) {
    return res.send("Uploads folder NOT found ❌");
  }

  const files = fs.readdirSync(uploadsPath);
  res.json(files);
});

// ✅ DEBUG: show server path
app.get("/debug-path", (req, res) => {
  res.send(__dirname);
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});