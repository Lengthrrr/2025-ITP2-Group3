const db = require("../config/db");
const bcrypt = require("bcrypt")
const path = require("path");
const fs = require("fs");

exports.getMapQuiz = (req, res) => {
    res.render("studentMapQuiz")
}
exports.getMultipleQuiz = (req, res) => {
    res.render("studentMultipleQuiz", {})
}

exports.getModule = (req, res) => {
  const moduleId = req.params.moduleId; // expecting route: /student/module/:moduleId

  const sql = `SELECT * FROM module WHERE module_id = ?`;

  db.get(sql, [moduleId], (err, module) => {
    if (err) {
      console.error(err);
      return res.render("studentModule", {
        module: null,
        error: "Failed to load module",
      });
    }

    if (!module) {
      return res.render("studentModule", {
        module: null,
        error: "Module not found",
      });
    }

    res.render("studentModule", { module, error: null });
  });
};

exports.getCourse = (req, res) => {
 const courseId = req.params.courseId;

  // Verify lecturer has access to this course
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
      res.render("studentCourse", { modules, error: null });
    });
};
