import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Absolute uploads path (IMPORTANT)
const uploadPath = path.join(__dirname, "../uploads");

// ✅ Ensure uploads folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// 🧠 TEMP STORAGE (in-memory DB)
let fileDB = [];

// ✅ FIXED multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // 🔥 FIX
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 📤 UPLOAD
router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  const file = req.file;

  fileDB.push({
    name: file.filename,
    userId: req.userId,
    isPublic: false
  });

  res.json({
    message: "File uploaded ✅",
    file: file.filename
  });
});

// 📂 GET USER FILES
router.get("/my-files", authMiddleware, (req, res) => {
  const userFiles = fileDB.filter(f => f.userId === req.userId);

  const fileDetails = userFiles.map((file) => {
    const filePath = path.join(uploadPath, file.name);

    if (!fs.existsSync(filePath)) return null;

    const stats = fs.statSync(filePath);

    return {
      name: file.name,
      size: (stats.size / 1024).toFixed(2) + " KB",
      date: stats.mtime,
      isPublic: file.isPublic
    };
  }).filter(Boolean);

  res.json({ files: fileDetails });
});

// 📥 DOWNLOAD (PRIVATE)
router.get("/download/:filename", authMiddleware, (req, res) => {
  const fileMeta = fileDB.find(
    f => f.name === req.params.filename && f.userId === req.userId
  );

  if (!fileMeta) {
    return res.status(403).json({ message: "Access denied ❌" });
  }

  const filePath = path.join(uploadPath, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// 🌐 PUBLIC DOWNLOAD
router.get("/public/:filename", (req, res) => {
  const fileMeta = fileDB.find(f => f.name === req.params.filename);

  if (!fileMeta || !fileMeta.isPublic) {
    return res.status(403).json({ message: "File is private ❌" });
  }

  const filePath = path.join(uploadPath, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// 🔗 TOGGLE PUBLIC/PRIVATE
router.post("/toggle/:filename", authMiddleware, (req, res) => {
  const fileMeta = fileDB.find(
    f => f.name === req.params.filename && f.userId === req.userId
  );

  if (!fileMeta) {
    return res.status(404).json({ message: "File not found" });
  }

  fileMeta.isPublic = !fileMeta.isPublic;

  res.json({
    message: fileMeta.isPublic ? "Now Public 🌐" : "Now Private 🔒",
    isPublic: fileMeta.isPublic
  });
});

// 🗑️ DELETE
router.delete("/delete/:filename", authMiddleware, (req, res) => {
  const fileMeta = fileDB.find(
    f => f.name === req.params.filename && f.userId === req.userId
  );

  if (!fileMeta) {
    return res.status(403).json({ message: "Access denied ❌" });
  }

  const filePath = path.join(uploadPath, req.params.filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);

    fileDB = fileDB.filter(f => f.name !== req.params.filename);

    return res.json({ message: "File deleted ✅" });
  } else {
    return res.status(404).json({ message: "File not found" });
  }
});

export default router;