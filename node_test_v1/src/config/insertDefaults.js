// insertDefaults.js
const bcrypt = require("bcrypt");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

// Promisify db.run
function runAsync(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID || this.changes);
    });
  });
}

function getAsync(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function insertDefaults() {
  const defaults = [
    { table: "course", field: "course_code", value: "course", password: "course" },
    { table: "user", field: "username", value: "lecturer", password: "lecturer", role: "lecturer" },
    { table: "user", field: "username", value: "admin", password: "admin", role: "admin" },
  ];

  for (const entry of defaults) {
    const hash = await bcrypt.hash(entry.password, 10);

    if (entry.table === "course") {
      await runAsync(
        `INSERT OR IGNORE INTO course (course_code, hashed_password) VALUES (?, ?)`,
        [entry.value, hash]
      );
      console.log(`✅ Ensured default course "${entry.value}"`);
    } else if (entry.table === "user") {
      await runAsync(
        `INSERT OR IGNORE INTO user (username, hashed_password, role) VALUES (?, ?, ?)`,
        [entry.value, hash, entry.role]
      );
      console.log(`✅ Ensured ${entry.role} "${entry.value}"`);
    }
  }

  // Link default lecturer to default course
  const course = await getAsync(`SELECT course_id FROM course WHERE course_code = ?`, ["course"]);
  const lecturer = await getAsync(`SELECT user_id FROM user WHERE username = ? AND role = 'lecturer'`, ["lecturer"]);

  if (course && lecturer) {
    await runAsync(
      `INSERT OR IGNORE INTO course_lecturer (course_id, lecturer_id) VALUES (?, ?)`,
      [course.course_id, lecturer.user_id]
    );
    console.log(`✅ Linked lecturer "${lecturer.user_id}" to course "${course.course_id}"`);
  }

  // -------------------- Insert Default Modules --------------------
  const modules = [
    { name: "India", description: "General information about India." },
    { name: "China", description: "General information about China." },
    { name: "Japan", description: "General information about Japan." },
    { name: "Taiwan", description: "General information about Taiwan." },
    { name: "Australia", description: "General information about Australia." },
  ];

  for (const mod of modules) {
    await runAsync(
      `INSERT OR IGNORE INTO module (course_id, start_time, module_title, module_description, type) 
       VALUES (?, ?, ?, ?, ?)`,
      ["1", 0, `${mod.name}`, mod.description, "general"]
    );
    console.log(`✅ Ensured module "${mod.name}"`);
  }
}

insertDefaults()
  .then(() => {
    console.log("🎉 Default users, course links, and modules inserted (with bcrypt hashes).");
    db.close();
  })
  .catch((err) => {
    console.error("❌ Failed inserting defaults:", err.message);
    db.close();
  });
