const db = require("../config/db");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const { runCreateGeemap } = require("../services/pythonService");

// ---------- RENDER PAGES ----------
exports.getModule = (req, res) => res.render("module", { error: null });
exports.getModuleEditor = (req, res) => res.render("lecturerModuleeditor", { error: null });
exports.postModuleViewer = (req, res) => res.render("module_viewer", { error: null });

// ---------- API ENDPOINTS ----------
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

// ---------- GEEMAP FILE SERVING ----------
exports.getGeemapFile = (req, res) => {
  const filePath = path.join(__dirname, "../../public/geemaps", req.params.file);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send("❌ Error: Map file not found");
    res.sendFile(filePath);
  });
};

// ---------- ADD MANUAL MAP MARKER ----------
exports.postManualMarker = async (req, res) => {
  const { moduleId, country, type, markerType, lat, lng, description } = req.body;
  const configPath = path.join(process.cwd(), "geemap_data", `map_config_${moduleId}.py`);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: `Config file for module ${moduleId} not found.` });
  }

  const newMarker = `
    {
        "Country": "${country}",
        ${lat && lng ? `"Lat": ${lat}, "Lon": ${lng},` : ""}
        "Type": "${type}",
        "MarkerType": "${markerType}",
        "DescriptionHTML": """${description}"""
    },`;

  let fileContent = fs.readFileSync(configPath, "utf-8");
  const updatedContent = fileContent.replace(/(profiles\s*=\s*\[)([\s\S]*?)(\n\])/m, `$1$2${newMarker}\n]`);
  fs.writeFileSync(configPath, updatedContent, "utf-8");

  await runCreateGeemap(moduleId);
  console.log(`✅ Added new marker to map_config_${moduleId}.py`);
  return res.json({ success: true, message: "Marker added successfully" });
};

// ---------- GET LECTURER COURSE ----------
exports.getCourse = (req, res) => {
  const lecturerId = req.session.user.id;
  const courseId = req.params.courseId;

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

    const sql = `SELECT * FROM module WHERE course_id = ?`;
    db.all(sql, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        return res.render("lecturerDashboard", {
          modules: [],
          error: "Failed to load modules",
        });
      }

      res.render("lecturerCourse", { courseId, modules, error: null });
    });
  });
};

// ---------- CREATE MODULE ----------


exports.createModule = (req, res) => {
  const course_id = req.params.courseId || req.body.course_id; // prefer param if available
  const { 
    start_time = 0, 
    module_title, 
    module_description, 
    type, 
    format = 'small_panel', 
    module_heading 
  } = req.body;

  console.log("=== createModule called ===");
  console.log({ course_id, start_time, module_title, module_description, type, format, module_heading });
  console.log("req.file:", req.file);

  if (!course_id || !module_title || !module_description || !module_heading) {
    console.error("Missing required fields ffs");
    console.error(course_id);
    console.error(module_title);
    console.error(module_description);
    console.error(module_heading);
    return res.status(400).json({ error: "Missing required fields" });
  }

  const insertSql = `
    INSERT INTO module (course_id, module_heading, start_time, module_title, module_description, type, format, image_file)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Default image placeholder for small_panel / quiz_panel
  const defaultImage = format === 'expandable' ? null : 'null.jpg';

  db.run(
    insertSql,
    [course_id, module_heading, start_time, module_title, module_description, type || 'general', format, defaultImage],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "Database error inserting module" });
      }

      const module_id = this.lastID;
      console.log(`Module created with ID: ${module_id}`);

      // Handle image upload if present and format is expandable
      if (req.file && format === 'expandable') {
        const ext = require('path').extname(req.file.originalname).toLowerCase();
        const targetDir = require('path').join(__dirname, "../public/student/course/Images");
        const targetPath = require('path').join(targetDir, `${module_id}${ext}`);

        console.log("Saving image to:", targetPath);

        try {
          require('fs').mkdirSync(targetDir, { recursive: true });
          require('fs').renameSync(req.file.path, targetPath);
          const imagePath = `${module_id}${ext}`;

          db.run(
            `UPDATE module SET image_file=? WHERE module_id=?`,
            [imagePath, module_id],
            function (err2) {
              if (err2) console.error("Error updating image path in DB:", err2);
              else console.log("Image path saved to module:", imagePath);
              return res.json({ module_id });
            }
          );
        } catch (fsErr) {
          console.error("File system error:", fsErr);
          return res.status(500).json({ error: "Failed to save image" });
        }
      } else {
        // No image upload, respond immediately
        return res.json({ module_id });
      }
    }
  );
};



// ---------- EDIT MODULE ----------
exports.editModule = (req, res) => {
    console.log("!1111");
  const { id } = req.params;
  const { course_id, start_time, module_title, module_description, type, format } = req.body;

  db.get(`SELECT image_file FROM module WHERE module_id=?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Module not found" });
    console.log("t")
    const newImage = req.file ? req.file.filename : row.image_file;
    console.log(newImage)
    // Delete old image if replaced and not null.jpg
    if (req.file && row.image_file && row.image_file !== "null.jpg") {

      const oldPath = path.join(__dirname, "../public/student/course/Images/" + course_id + "/", "" + id + ".jpg");
        console.log(oldPath)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    db.run(
      `UPDATE module 
       SET start_time=?, module_title=?, module_description=?, type=?, image_file=?, format=?
       WHERE module_id=?`,
      [start_time || 0, module_title, module_description, type, newImage, format, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, updated: this.changes });
      }
    );
  });
};

// ---------- DELETE MODULE ----------
exports.deleteModule = (req, res) => {
  const { id } = req.params;
  db.get(`SELECT image_file FROM module WHERE module_id=?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row && row.image_file && row.image_file !== "null.jpg") {
      const filePath = path.join(__dirname, "../public/student/course/Images", row.image_file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.run(`DELETE FROM module WHERE module_id=?`, [id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, deleted: this.changes });
    });
  });
};

// ---------- GET LECTURER DASHBOARD ----------
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

// ---------- CREATE COURSE ----------
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

    db.run(
      `INSERT INTO course (course_code, hashed_password) VALUES (?, ?)`,
      [course_code, hash],
      function (err2) {
        if (err2) {
          console.error(err2);
          return res.redirect("/lecturer/dashboard?error=Error+creating+course");
        }

        const courseId = this.lastID;

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
