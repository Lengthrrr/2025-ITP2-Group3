module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.login !== "success") {
    return res.redirect("/home/");
  }
  next();
};


function requireSystemAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") {
    return next();
  }
  return res.status(403).send("Access denied. System Admins only.");
}

module.exports = { requireSystemAdmin };

