// Creates the db if it doesn't exist

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  // Admin table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      user_hashed_password_with_salt TEXT,
      session_value VARCHAR
    );
  `);

  // Module table
  db.run(`
    CREATE TABLE IF NOT EXISTS module (
      module_id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_name TEXT,
      admin_id INTEGER,
      start_time INTEGER,
      module_title VARCHAR,
      module_description VARCHAR,
      type VARCHAR,
      FOREIGN KEY (admin_id) REFERENCES admin(user_id)
    );
  `);

  // Multiple choice question table
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

  // Select area question table
  db.run(`
    CREATE TABLE IF NOT EXISTS select_area_question (
      question_id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      correct_lat REAL,
      correct_long REAL,
      margin_of_error_meters REAL,
      hint TEXT,
      correct_country TEXT,
      correct_poi_id INTEGER,
      correct_poi_module_id INTEGER,
      FOREIGN KEY (module_id) REFERENCES module(module_id),
      FOREIGN KEY (correct_poi_id, correct_poi_module_id) REFERENCES poi(poi_id, module_id)
    );
  `);

  // POI table
  db.run(`
    CREATE TABLE IF NOT EXISTS poi (
      poi_id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      poi_name TEXT,
      poi_type TEXT,
      poi_details TEXT,
      followed_user_id INTEGER,
      created_at TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES module(module_id)
    );
  `);

  // Point table
  db.run(`
    CREATE TABLE IF NOT EXISTS point (
      point_id INTEGER PRIMARY KEY AUTOINCREMENT,
      poi_id INTEGER,
      country TEXT,
      latitude REAL,
      longitude REAL,
      FOREIGN KEY (poi_id) REFERENCES poi(poi_id)
    );
  `);
});

module.exports = db;

