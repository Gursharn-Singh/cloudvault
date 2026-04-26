import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// 🧠 TEMP STORAGE (in-memory database)
let fileDB = [];

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
  const file = req.file;

  // store metadata
  fileDB.push({
    name: file.filename,
    isPublic: false
  });

  res.json({
    message: "File uploaded ✅",
    file: file.filename
  });
});

// 📂 GET FILES
router.get("/my-files", authMiddleware, (req, res) => {
  const files = fs.readdirSync("uploads");

  const fileDetails = files.map((file) => {
    const stats = fs.statSync(path.join("uploads", file));

    const fileMeta = fileDB.find(f => f.name === file);

    return {
      name: file,
      size: (stats.size / 1024).toFixed(2) + " KB",
      date: stats.mtime,
      isPublic: fileMeta?.isPublic || false
    };
  });

  res.json({ files: fileDetails });
});

// 📥 DOWNLOAD (PRIVATE)
router.get("/download/:filename", authMiddleware, (req, res) => {
  const filePath = path.join("uploads", req.params.filename);

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

  const filePath = path.join("uploads", req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// 🔗 TOGGLE PUBLIC/PRIVATE
router.post("/toggle/:filename", authMiddleware, (req, res) => {
  const fileMeta = fileDB.find(f => f.name === req.params.filename);

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
  const filePath = path.join("uploads", req.params.filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);

    // remove from DB
    fileDB = fileDB.filter(f => f.name !== req.params.filename);

    return res.json({ message: "File deleted ✅" });
  } else {
    return res.status(404).json({ message: "File not found" });
  }
});

export default router;