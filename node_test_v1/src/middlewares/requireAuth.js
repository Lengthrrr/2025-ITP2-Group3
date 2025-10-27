function requireSystemAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") {
    return next();
  }
  return res.status(403).send("Access denied. System Admins only.");
}

function requireLecturer(req, res, next) {
  if (!req.session.user || req.session.user.role !== "lecturer") {
    return res.status(403).send("Access denied. Lecturers only.");
  }
  return next();
}

function requireCourse(req, res, next) {
    // return next();
  if (!req.session.user || req.session.user.role !== "course") {
    return res.status(403).send("Access denied. Logged in students only.");
  }
  return next();
}

module.exports = { requireSystemAdmin, requireLecturer, requireCourse };

