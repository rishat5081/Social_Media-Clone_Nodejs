const User = require("../../models/User");
const bcrypt = require("bcrypt");

// User.updateMany(
//   {},
//   {
//     $set: {
//       deleted: false,
//     },
//   },
//   (err, res) => {
//     if (err) console.log(err);
//
//     console.log(res);
//   }
// );
module.exports = {
  deleteUser: async (req, res) => {
    try {
      const { userId, password } = req.body;

      if (!userId) {
        res.status(400).send({ status: false, message: "UserId is required" });
        res.end();
        return;
      } else {
        const deleteUser = await User.findOne({
          _id: userId,
          deleted: false,
        }).select("password deleted");

        if (deleteUser?._id) {
          const isMatch = await bcrypt.compare(password, deleteUser.password);

          if (!isMatch) {
            res.status(404).send({
              status: false,
              message: `Incorrect Password`,
            });
            res.end();
            return;
          } else {
            const deleteUserStatus = await User.updateOne(
              {
                _id: userId,
                deleted: false,
              },
              {
                $set: {
                  deleted: true,
                },
              }
            );

            if (deleteUserStatus) {
              res.status(200).send({
                status: true,
                message: `Account Deleted Successfully`,
              });
              res.end();
              return;
            } else {
              res.status(404).send({
                status: false,
                message: `No user found with this user id :${userId}`,
              });
              res.end();
              return;
            }
          }
        } else {
          res.status(404).send({
            status: false,
            message: `No user found with this user id :${userId}`,
          });
          res.end();
          return;
        }
      }
    } catch (e) {
      if (e) {
        console.log(e);
        res.status(404).send({ status: false, message: e.message });
        res.end();
        return;
      }
    }
  },
};
