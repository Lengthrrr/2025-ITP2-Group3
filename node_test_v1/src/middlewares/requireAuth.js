module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.login !== "success") {
    return res.redirect("/home/");
  }
  next();
};

