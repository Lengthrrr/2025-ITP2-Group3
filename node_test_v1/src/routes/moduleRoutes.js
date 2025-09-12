const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");

// Pages
router.get("/module", moduleController.getModule);
router.get("/module_editor", moduleController.getModuleEditor);
router.post("/module_viewer", moduleController.postModuleViewer);

// API
router.get("/api/module_course", moduleController.getModuleCourse);
router.get("/api/module_region", moduleController.getModuleRegion);

// Geemap files
router.get("/module/geemaps/:file", moduleController.getGeemapFile);

// Marker API
router.post("/manual-marker", moduleController.postManualMarker);

module.exports = router;

