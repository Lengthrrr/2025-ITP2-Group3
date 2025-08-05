
require("ejs")

const express = require("express");
const session = require('express-session');

const app = express();
const port = 8001;

const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// app.set('view', path.join(__dirname, 'views'));


app.get("/", (req, res) => {
  res.render("home", { error: null });
});

app.post("/module_viewer", (req, res) => {
    return res.render("module_viewer", { error: null });
});

app.post("/module_editor", (req, res) => {
    return res.render("module_editor", { error: null });
});

app.get("/home", (req, res) => {
  res.render("home", { error: null });
});

app.get("/module_editor", (req, res) => {
  res.render("module_editor", { error: null });
});

app.get("/quiz", (req, res) => {
  res.render("quiz", { error: null });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
