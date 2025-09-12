const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Home page
router.get("/", authController.getHome);
router.get("/home", authController.getHome);
router.post("/home", authController.postLogin);

module.exports = router;

