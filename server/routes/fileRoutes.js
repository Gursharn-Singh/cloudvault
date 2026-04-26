import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 📤 UPLOAD
router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded ✅",
    file: req.file.filename
  });
});

// 📂 GET FILES
router.get("/my-files", authMiddleware, (req, res) => {
  const files = fs.readdirSync("uploads");
  res.json({ files });
});

// 📥 DOWNLOAD
router.get("/download/:filename", authMiddleware, (req, res) => {
  const filePath = path.join("uploads", req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// 🗑️ DELETE (FIXED)
router.delete("/delete/:filename", authMiddleware, (req, res) => {
  try {
    const filePath = path.join("uploads", req.params.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: "File deleted ✅" });
    } else {
      return res.status(404).json({ message: "File not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err });
  }
});

export default router;