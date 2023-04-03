const { buildSchema } = require("graphql");
const { mergeSchemas } = require("graphql-tools");
const userSchema = require("./user"),
  articleSchema = require("./article"),
  followerSchema = require("./follower"),
  blockUserSchema = require("./blockUser"),
  videoSchema = require("./video"),
  commentTypeDefs = require("./comment"),
  sessionTypeDefs = require("./session"),
  reportTypesDef = require("./report"),
  galleryTypesDef = require("./gallery"),
  adUserTypeDefs = require("./aduser"),
  videoAnalyticsDefs = require("./analytics"),
  compaignTypeDefs = require("./campaign"),
  notificatioinsTypeDefs = require("./Notifications"),
  subscribeUsersTypeDefs = require("./subscribeUsers"),
  profileRatingTypeDefs = require("./profileRating");

module.exports = mergeSchemas({
  schemas: [
    userSchema,
    articleSchema,
    followerSchema,
    blockUserSchema,
    videoSchema,
    commentTypeDefs,
    sessionTypeDefs,
    reportTypesDef,
    galleryTypesDef,
    adUserTypeDefs,
    compaignTypeDefs,
    videoAnalyticsDefs,
    profileRatingTypeDefs,
    subscribeUsersTypeDefs,
    notificatioinsTypeDefs
  ]
});
