const db = require("../config/db");
const bcrypt = require("bcrypt");

// Render dashboard
function getDashboard(req, res) {
  res.render("adminDashboard", {
    queryResult: [],
    queryError: null,
    accountMessage: null,
  });
}

// Run arbitrary query
function postQuery(req, res) {
  const { sql } = req.body;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.render("adminDashboard", {
        queryResult: [],
        queryError: err.message,
        accountMessage: null,
      });
    }
    return res.render("adminDashboard", {
      queryResult: rows,
      queryError: null,
      accountMessage: null,
    });
  });
}

// Create accounts (lecturer/admin/course)
async function postCreateUser(req, res) {
  const { role, username, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    if (role === "course") {
      db.run(
        `INSERT INTO course (course_code, course_password) VALUES (?, ?)`,
        [username, hash],
        (err) => {
          if (err) {
            return res.render("adminDashboard", {
              queryResult: [],
              queryError: null,
              accountMessage: "Error: " + err.message,
            });
          }
          return res.render("adminDashboard", {
            queryResult: [],
            queryError: null,
            accountMessage: `Course '${username}' created successfully.`,
          });
        }
      );
    } else {
      db.run(
        `INSERT INTO admin (user_name, user_hashed_password_with_salt, role) VALUES (?, ?, ?)`,
        [username, hash, role],
        (err) => {
          if (err) {
            return res.render("adminDashboard", {
              queryResult: [],
              queryError: null,
              accountMessage: "Error: " + err.message,
            });
          }
          return res.render("adminDashboard", {
            queryResult: [],
            queryError: null,
            accountMessage: `${role} '${username}' created successfully.`,
          });
        }
      );
    }
  } catch (e) {
    res.render("adminDashboard", {
      queryResult: [],
      queryError: null,
      accountMessage: "Error creating user: " + e.message,
    });
  }
}

module.exports = { getDashboard, postQuery, postCreateUser };
