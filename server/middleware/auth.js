const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(403).json({ error: "Access denied" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access denied" });
    }
    req.userId = user.userId;
    next();
  });
}

module.exports = authenticateJWT;