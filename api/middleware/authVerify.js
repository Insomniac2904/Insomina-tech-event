const jwt = require("jsonwebtoken");
const authVerify = async (req, res, next) => {
  const authHeader = await req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).json("Invalid Token.");
      }
      console.log("Token Verified");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("Not Authenticated");
  }
};

module.exports = authVerify;
