const User = require("../models/User");
var conn = require("../config/dbConn");
module.exports = {
  // getCollectionData: (name) => {
  //   return User.find().toArray();
  // },
  getCollectionData: (collectionName) => {
    return new Promise((resolve) => {
      conn.then(async (db) => {
        const data = db.collection(collectionName).find().toArray();
        resolve(data);
      });
    });
  }, //end helper
};
