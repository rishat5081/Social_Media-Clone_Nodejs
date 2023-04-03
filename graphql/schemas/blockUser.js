const { makeExecutableSchema } = require("graphql-tools");

const blockUserTypesDef = `

type BlockedUsers {
    userId : UserRef
}

type UserRef {
    _id : ID
    username : String
    avatar : String
}



input blockInput {
    userId : String!
}
input unblockInput {
    userId : String!
}



type RootMutation {
    blockUser(obj : blockInput) : String!
    unblockUser(obj : unblockInput) : String!
}


type RootQuery {
        blockedUsers(id : String!) : [BlockedUsers!]!

}

schema {
        query : RootQuery
        mutation : RootMutation
}
`;

module.exports = makeExecutableSchema({
  typeDefs: blockUserTypesDef
});
