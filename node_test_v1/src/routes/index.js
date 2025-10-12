const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const lecturerRoutes = require("./lecturerRoutes");
const studentRoutes = require("./studentRoutes");

// Mount routers
router.use("/", authRoutes);
router.use("/", adminRoutes);
router.use("/", lecturerRoutes);
router.use("/", studentRoutes);

module.exports = router;

