// routes/lecturerRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { requireLecturer } = require("../middlewares/requireAuth");
const lecturerController = require("../controllers/lecturerController");
const fs = require("fs");

const geemapStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const courseId = req.params.courseId;
    const uploadPath = path.join(__dirname, `../../public/module/geemaps/${courseId}`);
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`[Geemap Storage] Upload path: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const moduleId = req.params.id;
    const filename = `${moduleId}.html`;
    console.log(`[Geemap Storage] Saving file as: ${filename}`);
    cb(null, filename);
  },
});
const geemapUpload = multer({ storage: geemapStorage });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const courseId = req.params.courseId; // 👈 from URL /course/:courseId
        const uploadPath = path.join(
            __dirname,
            `../../public/student/course/Images/${courseId}`,
        );

        // ensure directory exists
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const moduleId = req.params.id; // 👈 from URL /modules/:id/edit
        const ext = path.extname(file.originalname); // keep original extension
        cb(null, `${moduleId}${ext}`); // 👈 filename: courseId.png
    },
});

const upload = multer({ storage });

// --- Dashboard and Course Pages ---
router.get(
    "/lecturer/dashboard",
    requireLecturer,
    lecturerController.getDashboard,
);
router.get(
    "/lecturer/course/:courseId",
    requireLecturer,
    lecturerController.getCourse,
);
router.get(
    "/lecturer/module/:courseId/:moduleId",
    requireLecturer,
    lecturerController.getModuleEditor,
);
router.get(
    "/lecturer/map_quiz/:courseId/:moduleId",
    requireLecturer,
    lecturerController.getMapQuiz,
);
router.get(
    "/lecturer/multiple_quiz/:courseId/:moduleId",
    requireLecturer,
    lecturerController.getMultipleQuiz,
);


// --- Module Management API (AJAX from frontend) ---
router.post(
    "/lecturer/course/:courseId/modules/add",
    requireLecturer,
    upload.single("module_image"),
    lecturerController.createModule, // ✅ fixed name
);

router.post(
    "/lecturer/course/:courseId/modules/:id/edit",
    requireLecturer,
    upload.single("module_image"),
    lecturerController.editModule,
);
router.post(
    "/lecturer/create-course",
    requireLecturer,
    lecturerController.createCourse,
);
router.delete(
    "/lecturer/course/:courseId/modules/:id/delete",
    requireLecturer,
    lecturerController.deleteModule,
);
router.post(
    "/lecturer/module/upload-geemap/:courseId/:id",
    requireLecturer,
    geemapUpload.single("geemapFile"),
    lecturerController.uploadGeemapC,
);
router.post(
  "/lecturer/course/:courseId/modules/:moduleId/update-questions",
  requireLecturer,
  lecturerController.updateMultipleChoiceQuestions
);

module.exports = router;
