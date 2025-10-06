const db = require("../config/db");
const bcrypt = require("bcrypt")
const path = require("path");
const fs = require("fs");

exports.getMapQuiz = (req, res) => {
  const moduleId = req.params.moduleId; // expecting route: /student/module/:moduleId
  const courseId = req.params.courseId; // expecting route: /student/module/:moduleId
 
  // Verify lecturer has access to this course
      console.log("Selecting all from module");
      console.log(courseId);
    // Fetch modules for this course
    const sql = `SELECT * FROM module WHERE course_id = ?`;

    db.all(sql, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        // return res.render("lecturerDashboard", {
        //   modules: [],
        //   error: "Failed to load modules",
        // });
      }
        console.log("mods")
    console.log(modules);      
    res.render("studentMapQuiz", {courseId, moduleId, modules})
  });
}

exports.getMultipleQuiz = (req, res) => {
  const moduleId = req.params.moduleId; // expecting route: /student/module/:moduleId
  const courseId = req.params.courseId; // expecting route: /student/module/:moduleId
 
  // Verify lecturer has access to this course
      console.log("Selecting all from module");
      console.log(courseId);
    // Fetch modules for this course
    const sql = `SELECT * FROM module WHERE course_id = ?`;

    db.all(sql, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        // return res.render("lecturerDashboard", {
        //   modules: [],
        //   error: "Failed to load modules",
        // });
      }
        console.log("mods")
    console.log(modules);   
    res.render("studentMultipleQuiz", {courseId, moduleId, modules})
  });
}

exports.getModule = (req, res) => {
  const moduleId = req.params.moduleId; // expecting route: /student/module/:moduleId
  const courseId = req.params.courseId; // expecting route: /student/module/:moduleId

  const sql = `SELECT * FROM module WHERE module_id = ?`;

  db.get(sql, [moduleId], (err, module) => {
    if (err) {
      console.error(err);
      return res.render("studentModule", {
        module: null,
          moduleId, courseId,
        error: "Failed to load module",
      });
    }

    if (!module) {
      return res.render("studentModule", {
        module: null,
          moduleId, courseId,
        error: "Module not found",
      });
    }
    const sql2 = `SELECT * FROM module WHERE course_id = ?`;

    db.all(sql2, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        // return res.render("lecturerDashboard", {
        //   modules: [],
        //   error: "Failed to load modules",
        // });
      }
        console.log("mods")
    console.log(modules);  
    res.render("studentModule", { module, modules, moduleId, courseId, error: null });
  });
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
        // return res.render("lecturerDashboard", {
        //   modules: [],
        //   error: "Failed to load modules",
        // });
      }
        console.log("mods")
    console.log(modules);
      res.render("studentCourse", { modules, courseId, error: null });
    });
};
