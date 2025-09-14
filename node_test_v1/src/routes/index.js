const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const moduleRoutes = require("./moduleRoutes");
const adminRoutes = require("./adminRoutes");
const quizRoutes = require("./quizRoutes");

// Mount routers
router.use("/", authRoutes);
router.use("/", moduleRoutes);
router.use("/", adminRoutes);
router.use("/", quizRoutes);

module.exports = router;

