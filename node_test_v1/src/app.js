const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const routes = require("./routes");
const sessionConfig = require("./config/session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");

app.use(session(sessionConfig));
app.use(bodyParser.urlencoded({ extended: true }));

// Mount routes
app.use("/", routes);

// Routes
// app.use("/auth", require("./routes/authRoutes"));
// app.use("/admin", require("./routes/adminRoutes"));


module.exports = app;

