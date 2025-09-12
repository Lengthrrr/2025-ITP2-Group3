const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin page
router.get("/administration", adminController.getAdministration);
router.post("/administration", adminController.postAdministration);

module.exports = router;

