const bcrypt = require("bcrypt");
const db = require("../config/db");

// -------------------- Attempt Login --------------------
async function attemptLogin(req, res) {
  const { username, password, role, course_code } = req.body;

  if (role === "course") {
    // ---- Course login ----
    db.get(
      `SELECT * FROM course WHERE course_code = ?`,
      [course_code],
      async (err, course) => {
        if (
          err ||
          !course ||
          !(await bcrypt.compare(password, course.hashed_password))
        ) {
          return res.render("login", { error: "Invalid course credentials" });
        }

        req.session.user = {
          id: course.course_id,
          role: "course",
          login: "success",
        };

        return res.redirect(`/student/course/${course.course_id}`);
      }
    );
  } else {
    // ---- Lecturer/Admin login ----
    db.get(
      `SELECT * FROM user WHERE username = ? AND role = ?`,
      [username, role],
      async (err, user) => {
        if (
          err ||
          !user ||
          !(await bcrypt.compare(password, user.hashed_password))
        ) {
          return res.render("login", { error: "Invalid credentials" });
        }

        req.session.user = {
          id: user.user_id,
          role: user.role,
          login: "success",
        };

        // Role-specific redirect
        console.log("Attempted login of " + user.role);
        if (user.role === "admin") {
          return res.redirect("/admin/dashboard");
        } else {
          return res.redirect("/lecturer/dashboard");
        }
      }
    );
  }
}

// -------------------- Check Session --------------------
function isLoggedIn(req) {
  return req.session?.user?.login === "success";
}

// -------------------- Create User (Admin/Lecturer) --------------------
function createUser(username, password, role = "lecturer") {
  bcrypt.hash(password, 10).then((hash) => {
    db.run(
      `INSERT INTO user (username, hashed_password, role) VALUES (?, ?, ?)`,
      [username, hash, role],
      (err) => {
        if (err) {
          console.error("❌ Failed to create user:", err.message);
        } else {
          console.log(`✅ User ${username} (${role}) created`);
        }
      }
    );
  });
}

// -------------------- Create Course --------------------
function createCourse(courseCode, password) {
  bcrypt.hash(password, 10).then((hash) => {
    db.run(
      `INSERT INTO course (course_code, hashed_password) VALUES (?, ?)`,
      [courseCode, hash],
      (err) => {
        if (err) {
          console.error("❌ Failed to create course:", err.message);
        } else {
          console.log(`✅ Course ${courseCode} created`);
        }
      }
    );
  });
}

module.exports = { attemptLogin, createUser, createCourse, isLoggedIn };
