const express = require("express");
const router = express.Router();
const { requireSystemAdmin } = require("../middlewares/requireAuth");
const adminController = require("../controllers/adminController");

// Protect all routes with requireSystemAdmin
router.get("/admin/dashboard", requireSystemAdmin, adminController.getDashboard);
router.post("/admin/query", requireSystemAdmin, adminController.postQuery);
router.post("/admin/create-user", requireSystemAdmin, adminController.postCreateUser);

module.exports = router;
