const bcrypt = require("bcrypt");
db = require("./sqlite_handler.js");

function attemptLogin(req, res) {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM admin WHERE user_name = ?`,
    [username],
    async (err, user) => {
      if (err) throw err;
      if (!user) {
        const errorMsg = "Invalid credentials";
        return res.render("home", { error: errorMsg });
      }

      if (
        !user ||
        !(await bcrypt.compare(password, user.user_hashed_password_with_salt))
      ) {
        const errorMsg = "Invalid credentials";
        return res.render("home", { error: errorMsg });
      } else {
        req.session.user = {
          id: user.user_id,
          name: user.user_name,
          login: "success",
        };
        return res.redirect("/module_editor");
      }
    },
  );
}

function isLoggedIn() {}
function createUser(username, password) {
  // const username = "patrick";
  // const password = "patrick";

  bcrypt.hash(password, 10).then((hash) => {
    db.run(
      `INSERT INTO admin (user_name, user_hashed_password_with_salt) VALUES (?, ?)`,
      [username, hash],
      () => {
        console.log("User created");
      },
    );
  });
}

module.exports = { attemptLogin, createUser, isLoggedIn };
