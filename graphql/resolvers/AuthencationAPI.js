const User = require("../../models/User");
const jwtDecode = require("jwt-decode");
module.exports = {
  authenticateUserEmail: async (req, res) => {
    try {
      const { authURL } = req.body;

      if (!authURL) {
        res.status(400).send({ message: "Authencation Url is required" });
        res.end();
        return;
      } else {
        const decodedEmail = await jwtDecode(authURL);

        const checked = await User.findOneAndUpdate(
          { email: decodedEmail.email, twoFactorAuthentication: false },
          { twoFactorAuthentication: true }
        );

        if (checked) {
          res
            .status(200)
            .send({ status: true, message: "Authencation is Complete" });
          res.end();
          return;
        } else if (checked === null) {
          res
            .status(200)
            .send({ status: true, message: "User is already Authenticated " });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log(e);
      res.status(404).send({ message: "Error in Authencation Url", error });
      res.end();
      return;
    }
  },
};
