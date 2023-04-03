const { getArticleById } = require("../../services/article");
const Session = require("../../models/Session");
const {
  getBlockUserDoc,
  createBlockedUser,
} = require("../../services/blockUser");
const { getSession } = require("../../services/session");
const { errorName } = require("../error/constants");

module.exports = {
  getAllSessions: async ({}, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const doc = await getSession(user.id);
      return doc.sessions;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  createSession: async ({ fingerprint, device, browser }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const sessionDoc = await getSession(user.id);

      if (sessionDoc === null) {
        console.log("Inside ------------------------- NULLL");
        var session1 = new Session({
          userId: user.id,
          fingerprint,
          device,
          browser,
        });

        // save model to database
        session1.save(function (err, book) {
          if (err) return console.error(err);
          console.log(session1.name + " saved to bookstore collection.");
        });
        if (session1) return "SUCCESS";
      } else {
        let isFind = sessionDoc.sessions.findIndex(
          (s) => s.fingerprint === fingerprint
        );

        sessionDoc.sessions[isFind] = {
          fingerprint,
          device,
          browser,
          time: Date.now(),
        };
        await sessionDoc.save();
        return "SUCCESS";
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 64 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  deleteSession: async ({ fingerprint }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const sessionDoc = await getSession(user.id);
      if (sessionDoc) {
        let index = sessionDoc.sessions.findIndex(
          (s) => s.fingerprint == fingerprint
        );
        sessionDoc.sessions.splice(index, 1);
        await sessionDoc.save();
        return "SUCCESS";
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
};
