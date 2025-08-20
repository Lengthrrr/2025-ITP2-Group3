const db = require("./sqlite_handler.js");

function create_module(name, admin_id, start_time, module_title, module_description, type) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO module (
                module_name, admin_id, start_time, module_title, module_description, type
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [name, admin_id, start_time, module_title, module_description, type], function (err) {
            if (err) {
                console.error("❌ Error inserting module:", err.message);
                reject(err);
            } else {
                console.log(`✅ Module added with ID ${this.lastID}`);
                resolve(this.lastID); // return the new module_id
            }
        });
    });
}

module.exports = { create_module }

