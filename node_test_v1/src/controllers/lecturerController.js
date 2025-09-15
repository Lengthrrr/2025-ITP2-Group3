const db = require("../config/db");
const bcrypt = require("bcrypt")


exports.getCourse = (req, res) => {
  const lecturerId = req.session.user.id;
  const courseId = req.params.courseId;

  // Verify lecturer has access to this course
  const checkSql = `
    SELECT 1 FROM course_lecturer
    WHERE course_id = ? AND lecturer_id = ?
  `;

  db.get(checkSql, [courseId, lecturerId], (err, row) => {
    if (err) {
      console.error(err);
      return res.render("lecturerCourse", {
        modules: [],
        error: "Database error checking access",
      });
    }

    if (!row) {
      return res.render("lecturerCourse", {
        modules: [],
        error: "Access denied to this course",
      });
    }

      console.log("Selecting all from module");
      console.log(courseId);
    // Fetch modules for this course
    const sql = `
      SELECT * FROM module
      WHERE course_id = ?
    `;

    db.all(sql, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        return res.render("lecturerCourse", {
          modules: [],
          error: "Failed to load modules",
        });
      }

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
