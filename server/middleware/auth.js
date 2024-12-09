const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(403).json({ error: "Authentication token missing" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.userId = user.userId;  // store user ID in the request
    next();
  });
};

module.exports = authenticateJWT;