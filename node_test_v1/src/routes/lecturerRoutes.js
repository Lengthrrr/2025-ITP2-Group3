// routes/lecturerRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { requireLecturer } = require("../middlewares/requireAuth");
const lecturerController = require("../controllers/lecturerController");

// --- Multer setup for image uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/student/course/Images"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// --- Dashboard and Course Pages ---
router.get("/lecturer/dashboard", requireLecturer, lecturerController.getDashboard);
router.get("/lecturer/course/:courseId", requireLecturer, lecturerController.getCourse);
router.get("/lecturer/module_editor", requireLecturer, lecturerController.getModuleEditor);

// --- Module Management API (AJAX from frontend) ---
router.post(
  "/lecturer/course/:courseId/modules/add",
  requireLecturer,
  upload.single("module_image"),
  lecturerController.createModule // ✅ fixed name
);

router.post(
  "/lecturer/course/:courseId/modules/:id/edit",
  requireLecturer,
  upload.single("module_image"),
  lecturerController.editModule
);

router.delete(
  "/lecturer/course/:courseId/modules/:id/delete",
  requireLecturer,
  lecturerController.deleteModule
);

module.exports = router;
