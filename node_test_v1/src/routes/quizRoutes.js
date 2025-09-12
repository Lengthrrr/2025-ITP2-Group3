const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.get("/quiz", quizController.getQuiz);

module.exports = router;

