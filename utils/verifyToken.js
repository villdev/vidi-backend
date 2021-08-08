require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

module.exports = verifyToken;
