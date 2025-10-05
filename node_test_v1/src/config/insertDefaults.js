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
    { table: "course", field: "course_code", value: "User Testing", password: "User Testing" },
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
    { name: "Week 1: East Asia", description: "This week's content focuses on the East Asian area. Try to learn the East Asian countries along with their capitals. Also make sure to learn general population information.", heading: "Course Schedule", boss_desc: "DISCOVERING NEW PLACES EVERY WEEK", image_file: "week1.jpg"},
    { name: "Week 2: South East Asia", description: "This week's content adds onto last weeks content. Try to learn the added countries, along with their capitals and general population information." , heading: "Course Schedule", boss_desc: "DISCOVERING NEW PLACES EVERY WEEK", image_file: "week2.png"},
    { name: "Week 3: Oceania", description: "Course content for week 3. This week's content focuses on the Oceania area." , heading: "Course Schedule", boss_desc: "DISCOVERING NEW PLACES EVERY WEEK", image_file: "week3.png"},
    // { name: "Taiwan", description: "General information about Taiwan." , heading: "Course Schedule", boss_desc: "DISCOVERING NEW PLACES EVERY WEEK"},
    // { name: "Australia", description: "General information about Australia." , heading: "Course Schedule", boss_desc: "DISCOVERING NEW PLACES EVERY WEEK"},
    { name: "Main Map", description: "Main Map of the world. It contains content from all the weeks." , heading: "General Maps", boss_desc: "EXPLORING MAPS BELOW", image_file: "week4.jpg"},

  ];

  for (const mod of modules) {
    await runAsync(
      `INSERT OR IGNORE INTO module (course_id, module_heading, module_heading_description, start_time, module_title, module_description, type, image_file) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["1", mod.heading, mod.boss_desc, 0, `${mod.name}`, mod.description, "general", mod.image_file]
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
