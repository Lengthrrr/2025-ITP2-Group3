const express = require("express");
const router = express.Router();
const { requireCourse } = require("../middlewares/requireAuth");
const studentController = require("../controllers/studentController");


router.get("/student/course/:courseId", requireCourse, studentController.getCourse);
router.get("/student/module/:moduleId", requireCourse, studentController.getModule);

module.exports = router;
