const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      employeeId: user.employee || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

module.exports = generateToken;
