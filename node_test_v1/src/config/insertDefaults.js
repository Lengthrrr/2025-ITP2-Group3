const bcrypt = require("bcrypt");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

// Promisify db.run
function runAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
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
        {
            table: "course",
            field: "course_code",
            value: "Indo Pacific",
            password: "Indo Pacific",
        },
        {
            table: "user",
            field: "username",
            value: "Indo Pacific",
            password: "ILoveIndoPacific",
            role: "lecturer",
        },
        {
            table: "user",
            field: "username",
            value: "admin",
            password: "admin123321",
            role: "admin",
        },
    ];

    for (const entry of defaults) {
        const hash = await bcrypt.hash(entry.password, 10);

        if (entry.table === "course") {
            await runAsync(
                `INSERT OR IGNORE INTO course (course_code, hashed_password) VALUES (?, ?)`,
                [entry.value, hash],
            );
            console.log(`✅ Ensured default course "${entry.value}"`);
        } else if (entry.table === "user") {
            await runAsync(
                `INSERT OR IGNORE INTO user (username, hashed_password, role) VALUES (?, ?, ?)`,
                [entry.value, hash, entry.role],
            );
            console.log(`✅ Ensured ${entry.role} "${entry.value}"`);
        }
    }

    // Link default lecturer to default course
    const course = await getAsync(
        `SELECT course_id FROM course WHERE course_code = ?`,
        ["Indo Pacific"],
    );
    const lecturer = await getAsync(
        `SELECT user_id FROM user WHERE username = ? AND role = 'lecturer'`,
        ["Indo Pacific"],
    );

    if (course && lecturer) {
        await runAsync(
            `INSERT OR IGNORE INTO course_lecturer (course_id, lecturer_id) VALUES (?, ?)`,
            [course.course_id, lecturer.user_id],
        );
        console.log(
            `✅ Linked lecturer "${lecturer.user_id}" to course "${course.course_id}"`,
        );
    }

    // -------------------- Insert Default Modules --------------------
    const modules = [
        {
            name: "East Asia",
            description:
                "A center of economic power and strategic rivalry, also prone to earthquakes, tsunamis, and volcanic activity.",
            heading: "Explore By Region",
            boss_desc: "",
            image_file: "null.jpg",
            format: "small_panel",
        },
        {
            name: "South-East Asia",
            description:
                "A maritime hub of trade and cultural diversity, shaped by monsoons, typhoons, and active volcanoes.",
            heading: "Explore By Region",
            boss_desc: "",
            image_file: "null.jpg",
            format: "small_panel",
        },
        {
            name: "Oceania",
            description:
                "Australia, New Zealand, and Pacific islands, facing security challenges, rising seas, cyclones, and seismic risks.",
            heading: "Explore By Region",
            boss_desc: "",
            image_file: "null.jpg",
            format: "small_panel",
        },
        {
            name: "South Asia",
            description:
                "Anchored by India and Pakistan, defined by dense populations, monsoon reliance, and Himalayan seismic hazards.",
            heading: "Explore By Region",
            boss_desc: "",
            image_file: "null.jpg",
            format: "small_panel",
        },
        {
            name: "Indian Ocean Rim",
            description:
                "A strategic energy and trade corridor, exposed to cyclones, tsunamis, and fragile coastal ecosystems.",
            heading: "Explore By Region",
            boss_desc: "",
            image_file: "null.jpg",
            format: "small_panel",
        },
        {
            name: "Western Pacific Rim",
            description:
                "A dynamic arc of coastal states along the “Ring of Fire,” marked by major trade flows and frequent natural disasters.",
            heading: "Explore By Region",
            boss_desc: "",
            image_file: "null.jpg",
            format: "small_panel",
        },

        {
            name: "Week 1: Overview of Indo-Pacific Studies",
            description:
                "Broad Indo-Pacific (encompassing Indian, Southern, and Pacific Oceans, South and Southeast Asia, North and Northeast Asia, and west coasts of the Americas)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week1.jpg",
            format: "expandable",
        },
        {
            name: "Week 2: Defining the Indo-Pacific region and its diversity",
            description:
                "Broad Indo-Pacific, with emphasis on cultural diversity across South Asia (India, Pakistan, Sri Lanka, Bangladesh, Bhutan, Nepal), Southeast Asia (mainland vs. island), and small island developing states.",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week2.png",
            format: "expandable",
        },
        {
            name: "Week 3: Geopolitics and the Indian Ocean Region",
            description:
                "Indian Ocean (including Australia’s Indian Ocean territories)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week3.jpg",
            format: "expandable",
        },
        {
            name: "Week 4: Non-State actors and assessment",
            description:
                "Broad Indo-Pacific, with case studies from Southeast and South Asia.",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week4.jpg",
            format: "expandable",
        },
        {
            name: "Week 5: Geopolitics and the Indian Ocean Region",
            description:
                "Indian Ocean (including Australia’s Indian Ocean territories)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week5.jpg",
            format: "expandable",
        },
        {
            name: "Week 6: Australia's global engagement",
            description:
                "Broad Indo-Pacific, with connections to global powers (Europe, US).",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week6.jpg",
            format: "expandable",
        },
        {
            name: "Week 7: Australia's relations with Northeast Asia",
            description: "Northeast Asia (focus on Japan)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week7.jpg",
            format: "expandable",
        },
        {
            name: "Week 8: Assessment on Indo-Pacific Knowledge",
            description: "Broad Indo-Pacific",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week8.jpg",
            format: "expandable",
        },
        {
            name: "Week 9: Australia's relations with Southeast Asia",
            description: "Southeast Asia (focus on Indonesia and East Timor)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week9.jpg",
            format: "expandable",
        },
        {
            name: "Week 10: Australia's Law of the Sea diplomacy",
            description: "Indian and Pacific Oceans (focus on maritime zones)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week10.jpg",
            format: "expandable",
        },
        {
            name: "Week 11: UNCLOS and Antarctica",
            description: "Indian, Pacific, and Southern Oceans (Antarctica focus)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week11.jpg",
            format: "expandable",
        },
        {
            name: "Week 12: Space and Assessment",
            description: "Broad Indo-Pacific (space as a strategic domain)",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week12.jpg",
            format: "expandable",
        },
        {
            name: "Week 13: Course synthesis and exam preparation",
            description: "Broad Indo-Pacific",
            heading: "Course Schedule",
            boss_desc: "",
            image_file: "week13.jpg",
            format: "expandable",
        },

        {
            name: "MULTIPLE BOAT QUIZ",
            description:
                "Objective\nTest and reinforce core Indo-Pacific knowledge through timed multiple-choice questions.\n\nHow it works\nSail the boat to the island-- correct answers move it forward; incorrect ones pushit back.",
            heading: "Study Tools",
            boss_desc: "",
            image_file: "null.jpg",
            format: "quiz_panel",
        },
        {
            name: "MAP MAP QUIZ",
            description:
                "Objective\nBuild geographical awareness of the Indo-Pacific by identifying regions and maritime features.\n\nHow it works\nA region is highlighted-- pick the correct name from four choices; no timer, and you can restart anytime.",
            heading: "Study Tools",
            boss_desc: "",
            image_file: "null.jpg",
            format: "quiz_panel",
        },
    ];

    for (const mod of modules) {
        await runAsync(
            `INSERT OR IGNORE INTO module (course_id, module_heading, module_heading_description, start_time, module_title, module_description, type, image_file, format) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "1",
                mod.heading,
                mod.boss_desc,
                0,
                `${mod.name}`,
                mod.description,
                "general",
                mod.image_file,
                mod.format,
            ],
        );
        console.log(`✅ Ensured module "${mod.name}"`);
    }

    const defaultMAPQuestions = [
        {
            moduleTitle: "MAP MAP QUIZ",
            questions: [
                {
                    question_text: "Which bay is highlighted?",
                    correct_answer: "Bay of Bengal",
                    incorrect_answer_one: "Bay of Biscay",
                    incorrect_answer_two: "Brunei Bay",
                    incorrect_answer_three: "Baffin Bay",
                },
                {
                    question_text: "Which island is highlighted",
                    correct_answer: "Sri Lanka",
                    incorrect_answer_one: "Madagascar",
                    incorrect_answer_two: "Sumatra",
                    incorrect_answer_three: "Taiwan",
                },
                {
                    question_text: "Which sea is this?",
                    correct_answer: "South China Sea",
                    incorrect_answer_one: "East China Sea",
                    incorrect_answer_two: "Philippine Sea",
                    incorrect_answer_three: "Bay of Bengal",
                },
                {
                    question_text: "What island chain is this?",
                    correct_answer: "Philippines",
                    incorrect_answer_one: "Indonesia",
                    incorrect_answer_two: "Japan",
                    incorrect_answer_three: "Maldives",
                },
                {
                    question_text: "Identify this island",
                    correct_answer: "Java",
                    incorrect_answer_one: "Borneo",
                    incorrect_answer_two: "Sumatra",
                    incorrect_answer_three: "Sulawesi",
                },
                {
                    question_text: "Which island is this?",
                    correct_answer: "Borneo",
                    incorrect_answer_one: "Sulawesi",
                    incorrect_answer_two: "Papua New Guinea",
                    incorrect_answer_three: "Madagascar",
                },
                {
                    question_text: "What sea is highlighted?",
                    correct_answer: "East China Sea",
                    incorrect_answer_one: "South China Sea",
                    incorrect_answer_two: "Sea of Japan",
                    incorrect_answer_three: "Philippine Sea",
                },
                {
                    question_text: "Which ocean is this?",
                    correct_answer: "Indian Ocean",
                    incorrect_answer_one: "Pacific Ocean",
                    incorrect_answer_two: "Atlantic Ocean",
                    incorrect_answer_three: "Southern Ocean",
                },
            ],
        },
    ];

    for (const quiz of defaultMAPQuestions) {
        // Get the module_id from the module table
        const moduleRow = await getAsync(
            `SELECT module_id FROM module WHERE module_title = ? AND course_id = ?`,
            [quiz.moduleTitle, 1],
        );
        if (!moduleRow) continue;

        const moduleId = moduleRow.module_id;

        for (const q of quiz.questions) {
            await runAsync(
                `INSERT OR IGNORE INTO multiple_choice_question 
       (module_id, question_text, correct_answer, incorrect_answer_one, incorrect_answer_two, incorrect_answer_three)
       VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    moduleId,
                    q.question_text,
                    q.correct_answer,
                    q.incorrect_answer_one,
                    q.incorrect_answer_two,
                    q.incorrect_answer_three,
                ],
            );
            console.log(`✅ Inserted question for module "${quiz.moduleTitle}"`);
        }
    }

    const defaultQuestions = [
        {
            moduleTitle: "MULTIPLE BOAT QUIZ",
            questions: [
                {
                    question_text: "Which ocean borders East Africa?",
                    correct_answer: "Indian Ocean",
                    incorrect_answer_one: "Atlantic Ocean",
                    incorrect_answer_two: "Pacific Ocean",
                    incorrect_answer_three: "Southern Ocean",
                },
                {
                    question_text: "Which country is NOT in South Asia?",
                    correct_answer: "Thailand",
                    incorrect_answer_one: "Nepal",
                    incorrect_answer_two: "Bhutan",
                    incorrect_answer_three: "Sri Lanka",
                },
                {
                    question_text: "What is the capital of Indonesia?",
                    correct_answer: "Jakarta",
                    incorrect_answer_one: "Bangkok",
                    incorrect_answer_two: "Kuala Lumpur",
                    incorrect_answer_three: "Manila",
                },
            ],
        },
    ];

    for (const quiz of defaultQuestions) {
        // Get the module_id from the module table
        const moduleRow = await getAsync(
            `SELECT module_id FROM module WHERE module_title = ? AND course_id = ?`,
            [quiz.moduleTitle, 1],
        );
        if (!moduleRow) continue;

        const moduleId = moduleRow.module_id;

        for (const q of quiz.questions) {
            await runAsync(
                `INSERT OR IGNORE INTO multiple_choice_question 
       (module_id, question_text, correct_answer, incorrect_answer_one, incorrect_answer_two, incorrect_answer_three)
       VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    moduleId,
                    q.question_text,
                    q.correct_answer,
                    q.incorrect_answer_one,
                    q.incorrect_answer_two,
                    q.incorrect_answer_three,
                ],
            );
            console.log(`✅ Inserted question for module "${quiz.moduleTitle}"`);
        }
    }
}

insertDefaults()
    .then(() => {
        console.log(
            "🎉 Default users, course links, and modules inserted (with bcrypt hashes).",
        );
        db.close();
    })
    .catch((err) => {
        console.error("❌ Failed inserting defaults:", err.message);
        db.close();
    });
