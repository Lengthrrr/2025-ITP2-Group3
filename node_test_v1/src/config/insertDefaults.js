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
      else resolve(this.changes); // number of rows changed
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
      const changes = await runAsync(
        `INSERT OR IGNORE INTO course (course_code, hashed_password) VALUES (?, ?)`,
        [entry.value, hash]
      );
      console.log(
        changes ? `✅ Inserted default course "${entry.value}"` : `⚠️ Course "${entry.value}" already exists`
      );
    } else if (entry.table === "user") {
      const changes = await runAsync(
        `INSERT OR IGNORE INTO user (username, hashed_password, role) VALUES (?, ?, ?)`,
        [entry.value, hash, entry.role]
      );
      console.log(
        changes ? `✅ Inserted ${entry.role} "${entry.value}"` : `⚠️ ${entry.role} "${entry.value}" already exists`
      );
    }
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
    const changes = await runAsync(
      `INSERT OR IGNORE INTO module (module_name, lecturer_id, start_time, module_title, module_description, type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["course", 1, 0, `${mod.name}`, mod.description, "general"]
    );
    console.log(
      changes ? `✅ Inserted module "${mod.name}"` : `⚠️ Module "${mod.name}" already exists`
    );
  }
}

insertDefaults()
  .then(() => {
    console.log("🎉 Default users and modules inserted (with bcrypt hashes).");
    db.close();
  })
  .catch((err) => {
    console.error("❌ Failed inserting defaults:", err.message);
    db.close();
  });
