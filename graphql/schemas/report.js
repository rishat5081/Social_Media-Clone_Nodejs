const { makeExecutableSchema } = require("graphql-tools");

const reportTypesDef = `


type RootMutation {
    reportVideo (video_id : String! , message : String!) : String!
}
schema {
    mutation : RootMutation
}
`;

module.exports = makeExecutableSchema({
  typeDefs: reportTypesDef,
});
