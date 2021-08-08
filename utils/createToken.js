require("dotenv").config();
const jwt = require("jsonwebtoken");

const createToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      // email: user.email,
    },
    process.env.JWT_SECRET,
    //   { expiresIn: '30d' }
    { algorithm: "HS256", expiresIn: "30d" }
  );
};

module.exports = createToken;
