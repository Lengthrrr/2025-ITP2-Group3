const accessControl = require("../services/accessControl");

exports.getHome = (req, res) => {
  res.render("home", { error: null });
};

exports.postLogin = (req, res) => {
  accessControl.attemptLogin(req, res);
};

