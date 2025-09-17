// routes/lecturerRouter.js
const express = require("express");
const router = express.Router();
const { requireLecturer } = require("../middlewares/requireAuth");
const lecturerController = require("../controllers/lecturerController");

// Dashboard - view courses
router.get("/lecturer/dashboard", requireLecturer, lecturerController.getDashboard);
// router.get("/lecturer/course", requireLecturer, lecturerController.getCourse);
router.get("/lecturer/course/:courseId", requireLecturer, lecturerController.getCourse);
router.get("/lecturer/module_editor", requireLecturer, lecturerController.getModuleEditor);

// Create new course (form submission)
router.post("/lecturer/create-course", requireLecturer, lecturerController.createCourse);

// View specific course (example: /lecturer/course/5)
// router.get("/lecturer/course/:id", requireLecturer, lecturerController.viewCourse);

module.exports = router;
