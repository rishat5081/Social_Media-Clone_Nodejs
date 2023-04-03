const { makeExecutableSchema } = require("graphql-tools");

const subscribeUserTypesDef = `

type SubscribeBy{
    firstName:String
    lastName:String
    avatar:String
}

type PremiumUsers{
    subscribedBy: SubscribeBy
    createdAt:String
}


type RootQuery {
    getPremierUser(userId : String) : [PremiumUsers]
}

schema {
    query : RootQuery
}
`;

module.exports = makeExecutableSchema({
  typeDefs: subscribeUserTypesDef,
});
