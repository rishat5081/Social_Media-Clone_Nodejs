const { makeExecutableSchema } = require("graphql-tools");

const reportTypesDef = `
      type UserInfo{
        _id : ID!
        email:String!
      }
      type RootQuery{
        getUserPassInfo(passCode : Int!): UserInfo
      }
      schema {
        query: RootQuery
      }
`;

module.exports = makeExecutableSchema({
  typeDefs: reportTypesDef,
});

// type RootMutation {
//     addForgetPasscode (userEmail : String! , _id : ID!, passCode : Int!) : String!
// }

// mutation : RootMutation
