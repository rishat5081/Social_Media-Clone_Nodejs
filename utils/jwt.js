const jwt = require("jsonwebtoken");

const generateToken = async (payload, req, res) => {
  try {
    const token = await jwt.sign(payload, "v1yz8m00000", {
      expiresIn: 157683999999,
    });
    return token;
  } catch (err) {
    console.log(err);
    return new Error("NOT_FOUND");
  }
};

module.exports = generateToken;
