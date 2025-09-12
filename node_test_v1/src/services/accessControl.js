const bcrypt = require("bcrypt");
const db = require("../config/db");

async function attemptLogin(req, res) {
  const { username, password } = req.body;

  db.get(`SELECT * FROM admin WHERE user_name = ?`, [username], async (err, user) => {
    if (err) throw err;

    if (!user || !(await bcrypt.compare(password, user.user_hashed_password_with_salt))) {
      return res.render("home", { error: "Invalid credentials" });
    }

    req.session.user = {
      id: user.user_id,
      name: user.user_name,
      login: "success",
    };
    return res.redirect("/module_editor");
  });
}

function isLoggedIn(req) {
  return req.session?.user?.login === "success";
}

function createUser(username, password) {
  bcrypt.hash(password, 10).then((hash) => {
    db.run(
      `INSERT INTO admin (user_name, user_hashed_password_with_salt) VALUES (?, ?)`,
      [username, hash],
      () => console.log("User created")
    );
  });
}

module.exports = { attemptLogin, createUser, isLoggedIn };

