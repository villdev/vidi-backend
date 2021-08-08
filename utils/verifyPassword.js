const bcrypt = require("bcryptjs");

const verifyPassword = (passwordAttempt, hashedPassword) => {
  return bcrypt.compare(passwordAttempt, hashedPassword);
};

module.exports = verifyPassword;
