const generateToken = require("../utils/jwt");
const { sendSignUpAuthToUser } = require("../utils/emailService");
const randomString = require("randomstring");

module.exports = {
  generateAuthenticationToken: async (email) => {
    return new Promise(async (resolve, rejected) => {
      try {
        console.log("--------------- Generating the Token --------------- ");
        let forgetCode = randomString.generate({
          length: 10,
          charset: "hex",
        });
        const token = await generateToken({ email, code: forgetCode });
        const authURL = `https://www.vyzmo.com/verification?token=${token}`;
        sendSignUpAuthToUser(email, authURL);
        resolve(true);
      } catch (e) {
        rejected(e);
      }
    });
  },
};
