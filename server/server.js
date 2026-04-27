import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();

const app = express();

// ✅ Fix __dirname for ES modules (IMPORTANT)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files (FIXED PATH 🔥)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// ✅ Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted ✅",
    userId: req.userId
  });
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("CloudVault backend running 🚀");
});

// ✅ Debug route (optional but useful)
app.get("/debug-path", (req, res) => {
  res.send(__dirname);
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});