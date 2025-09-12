// Manages any secrets and environment variables

require("dotenv").config();

module.exports = {
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
};
