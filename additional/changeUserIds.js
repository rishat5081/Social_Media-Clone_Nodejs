const { getAllUsers } = require("../services/user");
const { getCollectionData } = require("./getCollection");
var conn = require("../config/dbConn");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  changeVideoIds: async (req, res) => {
    const { collectionName } = req.body;

    if (collectionName) {
      res.status(400).send("Error");
      res.end();
      return;
    } else {
      const usersData = await getCollectionData("users");
      const users_oldData = await getCollectionData("users_old");

      //   console.log(usersData.length);
      //   console.log(users_oldData.length);
      let userObject = reArrangeData(users_oldData, usersData);
      //   console.log(userObject);
      userObject.forEach((userData) => {
        console.log(userData.newID);
        conn.then(async (db) => {
          const data = await db
            .collection(`messages`)
            .find({
              sender: userData.oldID,
            })
            .toArray();

          //   const data = await db.collection(`notificaions`).updateOne(
          //     {
          //       notification_user_id: userData.oldID,
          //     },
          //     {
          //       $set: { notification_user_id: new ObjectId(userData.newID) },
          //     }
          //   );
          console.log(data);
        });
      });

      res.status(200).send("usersData, users_oldData");
    }
  },
};

function reArrangeData(oldUser, newUser) {
  let userObject = [];
  oldUser.forEach((old) => {
    newUser.forEach((newU) => {
      if (old.email === newU.email) {
        userObject.push({
          oldID: old._id,
          newID: newU._id,
        });
      }
    });
  });
  return userObject;
}
