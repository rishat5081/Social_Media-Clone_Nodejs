const bcrypt = require("bcrypt");
const generateToken = require("../../utils/jwt");
const { errorName } = require("../error/constants");

const { updateAdUserProfile } = require("../../services/adUser");
const AdUser = require("../../models/AdUser");

module.exports = {
  registerAdUser: async ({ adUserCredentials }, req) => {
    console.log(
      "🚀 ~ file: aduser.js ~ line 22 ~ registerAdUser: ~ adUserCredentials",
      adUserCredentials
    );
    try {
      let isUserExist = await AdUser.findOne({
        email: adUserCredentials.email,
      });
      if (isUserExist) {
        return new Error(errorName.CONFLICT);
      }

      let hashPw = await bcrypt.hash(adUserCredentials.password, 12);

      adUserCredentials.password = hashPw;

      await AdUser.create(adUserCredentials);

      return "Sucessfully registered";
    } catch (err) {
      console.log(
        "🚀 ~ file: aduser.js ~ line 37 ~ registerAdUser: ~ err",
        err
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },

  adLoginUser: async ({ adLoginCredentials }, req) => {
    try {
      let isUserExist;
      let usernameUser;
      if (adLoginCredentials.email.indexOf("@") !== -1) {
        isUserExist = await AdUser.findOne({ email: adLoginCredentials.email });
      } else {
        usernameUser = await AdUser.findOne({
          username: adLoginCredentials.email,
        });
        isUserExist = usernameUser;
      }

      if (!isUserExist && !usernameUser) {
        console.log("no user");
        return new Error(errorName.INVALID_CREDENTIALS);
      }

      const isMatch = await bcrypt.compare(
        adLoginCredentials.password,
        isUserExist.password
      );

      if (!isMatch) {
        console.log("Passord not match");
        return new Error(errorName.INVALID_CREDENTIALS);
      }
      const payload = {
        user: {
          id: isUserExist._id,
          email: isUserExist.email,
          acc_type: isUserExist.acc_type,
        },
      };

      const token = await generateToken(payload);
      if (isUserExist.twoFactorAuthentication) {
        return {
          code: 89898989,
        };
      }
      return {
        ...isUserExist._doc,
        token,
      };
    } catch (err) {
      console.log("🚀 ~ file: aduser.js ~ line 92 ~ adLoginUser: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  editAdUser: async ({ editedUser }, req) => {
    if (!editedUser) return new Error(errorName.BAD_REQUEST);
    const updateAdUserStatus = await updateAdUserProfile(
      editedUser.email,
      editedUser
    );

    const token = await generateToken({
      user: {
        id: updateAdUserStatus._id,
        email: updateAdUserStatus.email,
        acc_type: updateAdUserStatus.acc_type,
      },
    });
    return { ...updateAdUserStatus._doc, token };
  },
};
