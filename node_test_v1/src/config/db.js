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

  // -------------------- Join table: links lecturers <-> courses --------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS course_lecturer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      lecturer_id INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
      FOREIGN KEY (lecturer_id) REFERENCES user(user_id) ON DELETE CASCADE,
      UNIQUE(course_id, lecturer_id)
    );
  `);

  // -------------------- Modules --------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS module (
      module_id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id TEXT,
        module_heading VARCHAR,
        module_heading_description VARCHAR,
      start_time INTEGER,
      module_title VARCHAR,
      module_description VARCHAR,
      type VARCHAR,
        image_file VARCHAR
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
