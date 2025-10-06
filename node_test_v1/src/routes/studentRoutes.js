const express = require("express");
const router = express.Router();
const { requireCourse } = require("../middlewares/requireAuth");
const studentController = require("../controllers/studentController");


router.get("/student/course/:courseId", requireCourse, studentController.getCourse);
router.get("/student/module/:courseId/:moduleId", requireCourse, studentController.getModule);
router.get("/student/map_quiz/:courseId/:moduleId", requireCourse, studentController.getMapQuiz);
router.get("/student/multiple_quiz/:courseId/:moduleId", requireCourse, studentController.getMultipleQuiz);

module.exports = router;
