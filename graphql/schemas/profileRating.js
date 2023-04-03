const { makeExecutableSchema } = require("graphql-tools");

const reportTypesDef = `
      type UserRating{
        totalAmount:Int!
        count:Int!
      }
      type RootMutation {
          addProfileRating (profileRatedTo : String! , profileRatedBy : String!, rating : Int!) : String!
      }
      type RootQuery{
        getUserProfileRating(userId:String!): UserRating!
      }
      schema {
          query: RootQuery
          mutation : RootMutation
      }
`;

module.exports = makeExecutableSchema({
  typeDefs: reportTypesDef,
});
