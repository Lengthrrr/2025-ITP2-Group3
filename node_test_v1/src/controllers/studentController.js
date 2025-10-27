const db = require("../config/db");
const bcrypt = require("bcrypt")
const path = require("path");
const fs = require("fs");

exports.getMapQuiz = (req, res) => {
    const moduleId = req.params.moduleId;
    const courseId = req.params.courseId;

    // 1️⃣ Fetch the current module
    const sqlModule = `SELECT * FROM module WHERE module_id = ?`;

    db.get(sqlModule, [moduleId], (err, module) => {
        if (err) {
            console.error("Error fetching module:", err);
            return res.render("studentMapQuiz", {
                module: null,
                modules: [],
                moduleId,
                courseId,
                questions: [],
                error: "Failed to load module",
            });
        }

        if (!module) {
            return res.render("studentMapQuiz", {
                module: null,
                modules: [],
                moduleId,
                courseId,
                questions: [],
                error: "Module not found",
            });
        }

        // 2️⃣ Fetch all modules for this course
        const sqlAllModules = `SELECT * FROM module WHERE course_id = ?`;

        db.all(sqlAllModules, [courseId], (errModules, allModules) => {
            if (errModules) {
                console.error("Error fetching all modules:", errModules);
                return res.render("studentMapQuiz", {
                    module,
                    modules: [],
                    moduleId,
                    courseId,
                    questions: [],
                    error: "Failed to load modules",
                });
            }

            // 3️⃣ Fetch all questions for the current module
            const sqlQuestions = `SELECT * FROM multiple_choice_question WHERE module_id = ?`;

            db.all(sqlQuestions, [moduleId], (errQuestions, questions) => {
                if (errQuestions) {
                    console.error("Error fetching questions:", errQuestions);
                    return res.render("studentMapQuiz", {
                        module,
                        modules: allModules,
                        moduleId,
                        courseId,
                        questions: [],
                        error: "Failed to load questions",
                    });
                }

                // 4️⃣ Transform questions for the editor
                const formattedQuestions = questions.map((q) => ({
                    text: q.question_text,
                    options: [
                        q.correct_answer,
                        q.incorrect_answer_one,
                        q.incorrect_answer_two,
                        q.incorrect_answer_three,
                    ],
                    correct: 1, // index of correct answer (1-based)
                }));

                console.log(formattedQuestions)
                res.render("studentMapQuiz", {
                    module,
                    modules: allModules, // ✅ send all modules for sidebar/nav
                    moduleId,
                    courseId,
                    questions: formattedQuestions,
                    error: null,
                });
            });
        });
    });
};

exports.getMultipleQuiz = (req, res) => {
  const moduleId = req.params.moduleId; // route: /student/module/:moduleId
  const courseId = req.params.courseId;

  console.log("Fetching modules for course:", courseId);

  // Fetch all modules for this course
  const sqlModules = `SELECT * FROM module WHERE course_id = ?`;
  db.all(sqlModules, [courseId], (errModules, modules) => {
    if (errModules) {
      console.error("Error fetching modules:", errModules);
      return res.render("studentMultipleQuiz", {
        courseId,
        moduleId,
        modules: [],
        boatQuestions: [],
        error: "Failed to load modules",
      });
    }

    console.log("Modules:", modules);

    // Fetch all multiple choice questions for this module
    const sqlQuestions = `SELECT * FROM multiple_choice_question WHERE module_id = ?`;
    db.all(sqlQuestions, [moduleId], (errQuestions, questions) => {
      if (errQuestions) {
        console.error("Error fetching questions:", errQuestions);
        return res.render("studentMultipleQuiz", {
          courseId,
          moduleId,
          modules,
          boatQuestions: [],
          error: "Failed to load questions",
        });
      }

      // Transform questions for boat quiz: incorrect answers become clues
      const boatQuestions = questions.map((q) => ({
        question: q.question_text,
        clues: [
          q.incorrect_answer_one,
          q.incorrect_answer_two,
          q.incorrect_answer_three,
          q.incorrect_answer_four,
        ],
        answer: q.correct_answer,
      }));

      // Render template with modules + questions
      res.render("studentMultipleQuiz", {
        courseId,
        moduleId,
        modules,
        boatQuestions,
        error: null,
      });
    });
  });
};

exports.getModule = (req, res) => {
  const moduleId = req.params.moduleId; // expecting route: /student/module/:moduleId
  const courseId = req.params.courseId; // expecting route: /student/module/:moduleId

  const sql = `SELECT * FROM module WHERE module_id = ?`;

  db.get(sql, [moduleId], (err, module) => {
    if (err) {
      console.error(err);
      return res.render("studentModule", {
        module: null,
          moduleId, courseId,
        error: "Failed to load module",
      });
    }

    if (!module) {
      return res.render("studentModule", {
        module: null,
          moduleId, courseId,
        error: "Module not found",
      });
    }
    const sql2 = `SELECT * FROM module WHERE course_id = ?`;

    db.all(sql2, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        // return res.render("lecturerDashboard", {
        //   modules: [],
        //   error: "Failed to load modules",
        // });
      }
        console.log("mods")
    console.log(modules);  
    res.render("studentModule", { module, modules, moduleId, courseId, error: null });
  });
  });
};

exports.getCourse = (req, res) => {
 const courseId = req.params.courseId;

  // Verify lecturer has access to this course
      console.log("Selecting all from module");
      console.log(courseId);
    // Fetch modules for this course
    const sql = `SELECT * FROM module WHERE course_id = ?`;

    db.all(sql, [courseId], (err2, modules) => {
      if (err2) {
        console.error(err2);
        // return res.render("lecturerDashboard", {
        //   modules: [],
        //   error: "Failed to load modules",
        // });
      }
        console.log("mods")
    console.log(modules);
      res.render("studentCourse", { modules, courseId, error: null });
    });
};
