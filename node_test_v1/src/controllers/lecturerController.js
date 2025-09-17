const db = require("../config/db");
const bcrypt = require("bcrypt")
const path = require("path");
const fs = require("fs");
const { runCreateGeemap } = require("../services/pythonService");

// Render pages
exports.getModule = (req, res) => res.render("module", { error: null });
exports.getModuleEditor = (req, res) => res.render("lecturerModuleeditor", { error: null });
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
exports.getCourse = (req, res) => {
  const lecturerId = req.session.user.id;
  const courseId = req.params.courseId;

  // Verify lecturer has access to this course
console.log(lecturerId);
console.log(courseId);
  const checkSql = `
    SELECT 1 FROM course_lecturer
    WHERE course_id = ? AND lecturer_id = ?
  `;

  db.get(checkSql, [courseId, lecturerId], (err, row) => {
    if (err) {
      console.error(err);
      return res.render("lecturerDashboard", {
        modules: [],
        error: "Database error checking access",
      });
    }

    if (!row) {
      return res.render("lecturerDashboard", {
        modules: [],
        error: "Access denied to this course",
      });
    }

      console.log("Selecting all from module");
      console.log(courseId);
    // Fetch modules for this course
    const sql = `SELECT * FROM module WHERE course_id = ?`;

    db.all(sql, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        return res.render("lecturerDashboard", {
          modules: [],
          error: "Failed to load modules",
        });
      }
        console.log("mods")
    console.log(modules);
      res.render("lecturerCourse", { modules, error: null });
    });
  });
};
exports.getDashboard = (req, res) => {
  const lecturerId = req.session.user.id;

  const sql = `
    SELECT c.* 
    FROM course c
    JOIN course_lecturer cl ON c.course_id = cl.course_id
    WHERE cl.lecturer_id = ?
  `;

  db.all(sql, [lecturerId], (err, courses) => {
    if (err) {
      console.error(err);
      return res.render("lecturerDashboard", {
        courses: [],
        error: "Failed to load courses",
      });
    }

    res.render("lecturerDashboard", { courses, error: null });
  });
};

exports.createCourse = (req, res) => {
  const lecturerId = req.session.user.id;
  const { course_code, password } = req.body;

  if (!course_code || !password) {
    return res.redirect("/lecturer/dashboard?error=Missing+fields");
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      return res.redirect("/lecturer/dashboard?error=Error+creating+course");
    }

    // Step 1: Insert course
    db.run(
      `INSERT INTO course (course_code, hashed_password) VALUES (?, ?)`,
      [course_code, hash],
      function (err2) {
        if (err2) {
          console.error(err2);
          return res.redirect("/lecturer/dashboard?error=Error+creating+course");
        }

        const courseId = this.lastID; // new course id

        // Step 2: Link lecturer <-> course in join table
        db.run(
          `INSERT INTO course_lecturer (course_id, lecturer_id) VALUES (?, ?)`,
          [courseId, lecturerId],
          function (err3) {
            if (err3) {
              console.error(err3);
              return res.redirect("/lecturer/dashboard?error=Error+linking+lecturer");
            }

            res.redirect("/lecturer/dashboard");
          }
        );
      }
    );
  });
};
