const { makeExecutableSchema } = require("graphql-tools");

const sessionTypesDef = `

type Sessions {
    fingerprint : String
    device : String
    browser : String
    time : String
}


type RootMutation {
    getAllSessions : [Sessions]
    createSession(fingerprint : String! , device : String!, browser  : String!) : String!
    deleteSession(fingerprint : String!) : String!
}


type RootQuery {
    getAllSessions : [Sessions]
}

schema {
        query : RootQuery
        mutation : RootMutation
}
`;

module.exports = makeExecutableSchema({
  typeDefs: sessionTypesDef,
});
