require("ejs");

const express = require("express");
const session = require('express-session');
const fs = require("fs");

const app = express();
const port = 8001;

const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./sqlite_handler.js");

const access_control = require("./access_control");
// access_control.createUser("patrick", "patrick");

const module_handler = require("./module_handler");
// module_handler.create_module("test", 1, 1000000, "East Asia", "Curious about East Asia? Learn more here and test your knowledge.", "region");
// module_handler.create_module("test", 1, 1000000, "South East Asia", "Ever wanted to dig deeper in the hidden gems of South East Asia? Then explore here.`", "region");
// module_handler.create_module("test", 1, 1000000, "Oceania", "Oceania is more than a pretty name. Find out why and learn more.", "region");
//
// module_handler.create_module("test", 1, 1000000, "South Asia", "Improve your knowledge about South Asia and become the expert right here, right now.", "region");
// module_handler.create_module("test", 1, 1000000, "Indian Ocean Rim", "Yes the Indian Ocean is connected to the Indo-Pacific. Discover more and learn about its geographic treasures.", "region");
// module_handler.create_module("test", 1, 1000000, "Western Pacific Rim", "Improve user knowledge on the Western Pacific Rim now!", "region");
//


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

// Endpoint to serve geemap files dynamically
app.get('/module/geemaps/:file', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'geemaps', req.params.file);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('❌ Error: Map file not found');
    }
    res.sendFile(filePath);
  });
});

// API route to fetch all modules
app.get("/api/module_course", (req, res) => {
    db.all(`SELECT * FROM module WHERE type = "course"`, [], (err, rows) => {
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows); // send all rows to client
    });
});
 
app.get("/api/module_region", (req, res) => {
    db.all(`SELECT * FROM module WHERE type = "region"`, [], (err, rows) => {
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows); // send all rows to client
    });
});
    

app.post("/module_editor", (req, res) => {
    return res.render("module_editor", { error: null });
});

app.get("/home", (req, res) => {
  res.render("home", { error: null });
});

app.get("/module", (req, res) => {
  res.render("module", { error: null });
});

app.get("/administration", (req, res) => {
  res.render("administration", { error: null });
});

app.post("/administration", (req, res) => {
    const userInput = req.body.pataIn;

    // Spawn Python process
    const py = spawn("python3", ["geemap_scripts/create_geemap.py"]);

    let result = "";
    py.stdout.on("data", (data) => {
        result += data.toString();
        console.log(result);
    });


    py.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });

    py.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        res.send(`<pre>${result}</pre>`);
    });

    // send user input to Python script
    py.stdin.write(userInput);
    py.stdin.end();
});

// app.use(requireAuth);

app.get("/module_editor", (req, res) => {
  res.render("module_editor", { error: null });
});

app.get("/quiz", (req, res) => {
  res.render("quiz", { error: null });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
