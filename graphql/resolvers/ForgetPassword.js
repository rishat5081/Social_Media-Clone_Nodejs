const ForgetPassword = require("../../models/ForgetPassword");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;
module.exports = {
  resetPassword: async (req, res) => {
    try {
      const { passCode, newPassword, userId } = req.body;
      if (!(passCode && newPassword && userId)) {
        res.status(400).send({
          status: false,
          message: "User Id && Pass Code and New Password is required",
        });
        res.end();
        return;
      } else {
        const forgetPassword = await ForgetPassword.findOne({
          userId: new objectId(userId),
          passcode: passCode,
        });

        if (forgetPassword._id) {
          let hashPw = await bcrypt.hash(newPassword, 12);

          const updatePassword = await User.updateOne(
            { _id: new objectId(userId) },
            { password: hashPw }
          );

          if (updatePassword) {
            await ForgetPassword.deleteOne({
              userId: new objectId(userId),
              passcode: passCode,
            });

            res
              .status(200)
              .send({ status: true, message: "Password is reset" });
            res.end();
            return;
          } else {
            res
              .status(200)
              .send({ status: false, message: "Unable to reset password" });
            res.end();
            return;
          }
        } else {
          res
            .status(200)
            .send({ status: false, message: "No passcode and found" });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log(e);
      res
        .status(404)
        .send({ status: false, message: "Unable to reset password", error });
      res.end();
      return;
    }
  },
};
