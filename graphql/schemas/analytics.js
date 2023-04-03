const { makeExecutableSchema } = require("graphql-tools");
const videoAnalyticsDefs = `
        input VideoId {
            _id : String!
        }

        type Analytics{
            commentPercentage : String
            likesPercentage : String
            viewsPercentage : String
            sharePercentage : String
            downloadsPercentage : String
        }

        type RootQuery {
            videoAnalytics(userId : String) : Analytics!
        }

        schema {
            query : RootQuery
        }
    `;

module.exports = makeExecutableSchema({
  typeDefs: videoAnalyticsDefs
});
