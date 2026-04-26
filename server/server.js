import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();

const app = express(); // ✅ FIRST create app

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// ✅ NOW use protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted ✅",
    userId: req.userId
  });
});

// test route
app.get("/", (req, res) => {
  res.send("CloudVault backend running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
 
app.use("/api/files", fileRoutes);