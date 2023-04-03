const AdUser = require("../models/AdUser");

module.exports = {
  updateAdUserProfile: async (email, newData) => {
    return await AdUser.findOneAndUpdate(
      { email },
      { $set: newData },
      { new: true }
    );
  },
};
