var MongoClient = require("mongodb").MongoClient;
function connectionDatabase() {
  return new Promise((resolve, reject) => {
    var url = "";
    MongoClient.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      async (err, client) => {
        if (err) {
          //db.close();
          reject(err);
        } else {
          const db = client.db("Vyzmo");
          resolve(db);
        }
      }
    );
  });
}
module.exports = connectionDatabase();
