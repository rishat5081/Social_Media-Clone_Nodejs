const Session = require("../models/Session");

const getSession = (id) => {
  return Session.findOne({ userId: id });
};

module.exports = {
  getSession,
};
