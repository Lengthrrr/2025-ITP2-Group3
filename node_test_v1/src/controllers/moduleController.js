const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { runCreateGeemap } = require("../services/pythonService");

// Render pages
exports.getModule = (req, res) => res.render("module", { error: null });
exports.getModuleEditor = (req, res) => res.render("module_editor", { error: null });
exports.postModuleViewer = (req, res) => res.render("module_viewer", { error: null });

// API endpoints
exports.getModuleCourse = (req, res) => {
  db.all(`SELECT * FROM module WHERE type = "course"`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
};

exports.getModuleRegion = (req, res) => {
  db.all(`SELECT * FROM module WHERE type = "region"`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
};

// Serve geemap files
exports.getGeemapFile = (req, res) => {
  const filePath = path.join(__dirname, "../../public/geemaps", req.params.file);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send("❌ Error: Map file not found");
    res.sendFile(filePath);
  });
};

// Manual marker addition
exports.postManualMarker = async (req, res) => {
  const { moduleId, country, type, markerType, lat, lng, description } = req.body;
  const configPath = path.join(process.cwd(), "geemap_data", `map_config_${moduleId}.py`);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: `Config file for module ${moduleId} not found.` });
  }

  let newMarker = lat && lng
    ? `
    {
        "Country": "${country}",
        "Lat": ${lat},
        "Lon": ${lng},
        "Type": "${type}",
        "MarkerType": "${markerType}",
        "DescriptionHTML": """${description}"""
    },`
    : `
    {
        "Country": "${country}",
        "Type": "${type}",
        "MarkerType": "${markerType}",
        "DescriptionHTML": """${description}"""
    },`;

  let fileContent = fs.readFileSync(configPath, "utf-8");
  const updatedContent = fileContent.replace(/(profiles\s*=\s*\[)([\s\S]*?)(\n\])/m, `$1$2${newMarker}\n]`);
  fs.writeFileSync(configPath, updatedContent, "utf-8");

  await runCreateGeemap(moduleId);

  console.log(`Added new marker to map_config_${moduleId}.py`);
  return res.json({ success: true, message: "Marker added successfully" });
};

