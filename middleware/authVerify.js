const { verifyToken } = require("../utils/index");

const authVerify = (req, res, next) => {
  const token = req.headers.authorization;

  // ! cookie--------------------------------------------------->
  //   const token = req.cookie.token;

  if (!token) {
    return res.status(401).json({ message: "Login required." });
    // return res.status(401).json({ message: "Authentication invalid" });
  }
  // const decodedToken = jwtDecode(token.slice(7));
  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(403).json({
      message: "There was a problem authorizing the request",
    });
  } else {
    req.user = decodedToken;
    next();
  }
};

module.exports = authVerify;
