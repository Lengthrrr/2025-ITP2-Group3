const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Home page
// router.get("/", authController.redirectLogin);
router.get("/", (req, res) => {
  res.redirect("/student/course/1");
});
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/home", authController.getHome);

// --------------------- STATIC PAGES ---------------------
// About
router.get("/about", (req, res) => {
  res.render("about"); // about.ejs / about.html in views/public
});

// Contact
router.get("/contact", (req, res) => {
  res.render("contact"); // contact.ejs / contact.html
});

// User Guides
router.get("/guides", (req, res) => {
  res.render("guides"); // guides.ejs / guides.html
});

module.exports = router;

