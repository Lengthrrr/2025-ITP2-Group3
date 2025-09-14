// Manages any secrets and environment variables

require("dotenv").config();

module.exports = {
  secret: process.env.SESSION_SECRET || "I HAVE NO CLUE WHAT THIS DOES 3312",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
};
