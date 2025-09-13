// database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "database.db"); // same folder as insertDefaults.js
const db = new sqlite3.Database(dbPath);


db.serialize(() => {
  // -------------------- Users (lecturers + admins) --------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      hashed_password TEXT,
      role TEXT CHECK(role IN ('admin','lecturer')),
      session_value TEXT
    );
  `);

  // -------------------- Courses --------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS course (
      course_id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT UNIQUE,
      hashed_password TEXT,
      session_value TEXT
    );
  `);

  // -------------------- Modules --------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS module (
      module_id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_name TEXT,
      lecturer_id INTEGER,
      start_time INTEGER,
      module_title VARCHAR,
      module_description VARCHAR,
      type VARCHAR,
      FOREIGN KEY (lecturer_id) REFERENCES user(user_id)
    );
  `);

  // -------------------- Multiple choice questions --------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS multiple_choice_question (
      question_id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      question_text TEXT,
      correct_answer TEXT,
      incorrect_answer_one TEXT,
      incorrect_answer_two TEXT,
      incorrect_answer_three TEXT,
      FOREIGN KEY (module_id) REFERENCES module(module_id)
    );
  `);
});

module.exports = db;
