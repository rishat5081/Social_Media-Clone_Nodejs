const { makeExecutableSchema } = require("graphql-tools");

const followerTypeDefs = `


            type Users {
                userId : String
                rating : [Rating]

            }

            type FollowBy {
                _id:ID!
                userId : User
            }
            type User {
                _id : ID!
                username : String
                email : String
                password : String
                age : String
                gender : String
                firstName : String
                online : Boolean
                lastName : String
                avatar : String
                webLink : String
                about : String
                facebook : String
                tiktok : String
                twitter : String
                instagram : String
                backgroundCover : String
                createdAt : String
                updatedAt : String
                am_i_followed : Boolean
                vyzmo_id : Int
            }

            type Follower {
                userId : String!
                followBy : [FollowBy]
            }

            input addFollower {
                followToId : String!
            }

            input removeFollower {
                removeFollwerId : String!
            }

            type FollowerDoc{
                userId : User
                followers : Int
                _id : ID!
                followTo : [followToDoc]
                followBy : [FollowByDoc]
                views : Int
                shares : Int
                downloads : Int
                am_i_followed : Boolean
                average_rating: Float
            }

            type Rating {
                userId : String!
                points : Float!
            }

            type followToDoc {
                userId : User
            }
            type FollowByDoc {
                userId : User
            }

            type Following{
                _id: ID
                username:String
                avatar: String
            }

            type RootMutation {
                addFollwer(whoToFollow : addFollower) : String
                removeFollower(whichFollower : removeFollower) : String
            }


            type RootQuery {
                followers : Follower!
                getAllUserFollowers(id : String!) :Int!
                getVisitorProfileFollowers(id : String!) :  FollowerDoc
                getTopFollowersUser : [FollowerDoc]
                getAllFollowingUsers(id : String!) : [Following]
            }

            schema {
                query : RootQuery
                mutation : RootMutation
            }

            `;

module.exports = makeExecutableSchema({
  typeDefs: followerTypeDefs
});
