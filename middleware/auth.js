const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const authenticated = async (req, res, next) => {
  const token = req.header("Authorization");
  // console.log("🚀 ~ file: auth.js ~ line 5 ~ authenticated ~ token", token)
  if (!token) {
    req.isAuth = false;
    return next();
  }

  try {
    const newToken = token.split(" ")[1];
    // console.log("🚀 ~ file: auth.js ~ line 12 ~ authenticated ~ newToken", token)

    const decoded = await jwt.decode(newToken, process.env.JWT_SECRET);
    req.isAuth = true;
    req.user = decoded.user;

    return next();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//middleware for the validating token
const validateToken = async (req, res, next) => {
  if (req.headers.authorization) {
    const bearerHeader = req.headers.authorization.split(" ");
    const jwtToken = bearerHeader[1];

    if (jwtToken) {
      const verificationResponse = await jwtDecode(bearerHeader[1]);
      if (verificationResponse) {
        req.user = { id: verificationResponse.user.id };

        next();
      }
    } else {
      res
        .status(400)
        .send({ success: false, message: "Invalid Token,Try Again" });
      res.end();
    }
  } else {
    res.status(400).send({ success: false, message: "Token is Required" });
    res.end();
  }
};

module.exports = { authenticated, validateToken };
