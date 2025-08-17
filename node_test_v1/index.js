require("ejs");

const express = require("express");
const session = require('express-session');

const app = express();
const port = 8001;

const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const db = require("./sqlite_handler.js");

const access_control = require("./access_control");

access_control.createUser("patrick", "patrick");
// db is now ready to use!

app.use(express.urlencoded({ extended: true })); // for parsing form POSTs
app.use(express.json()); // if using JSON bodies

// auth makes sure a user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/home/');
  if (req.session.user.login != "success") return res.redirect('/home/')
  next();
};

app.use(
  session({
    secret: "your_secret_here", // change this to something random
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true if using HTTPS
  })
);

app.get("/", (req, res) => {
  res.render("home", { error: null });
});

app.post("/module_viewer", (req, res) => {
    return res.render("module_viewer", { error: null });
});

app.post("/home", (req, res) => {
    access_control.attemptLogin(req, res);
});

app.post("/module_editor", (req, res) => {
    return res.render("module_editor", { error: null });
});

app.get("/home", (req, res) => {
  res.render("home", { error: null });
});

app.use(requireAuth);

app.get("/module_editor", (req, res) => {
  res.render("module_editor", { error: null });
});

app.get("/quiz", (req, res) => {
  res.render("quiz", { error: null });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
