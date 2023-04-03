const { makeExecutableSchema } = require("graphql-tools");

const commentTypeDefs = `

    type User {
            _id : ID!
            username : String!
            email : String!
            password : String!
            age : String
            gender : String
            firstName : String
            lastName : String
            avatar : String
            webLink : String
            about : String
            facebook : String
            tiktok : String
            twitter : String
            instagram : String
            background : String
            createdAt : String!
            updatedAt : String!
            token : String
            donationPaypalEmail : String!
        }
        
        
        input UserRegistration {
            username : String!
            email : String!
            password : String!
            phoneNumber : String!
            age : String
            gender : String
            firstName : String
            lastName : String
            avatar : String
            webLink : String
            about : String
            facebook : String
            tiktok : String
            twitter : String
            instagram : String
            background : String
        
        }
        input UserLogin {
            email : String!
            password : String!
        }
        
        input UserEdit {
            username : String
            email : String
            password : String
            age : String
            gender : String
            firstName : String
            lastName : String
            avatar : String
            webLink : String
            about : String
            facebook : String
            tiktok : String
            twitter : String
            instagram : String
            background : String
            donationPaypalEmail : String
        }

        input PasswordEdit {
            oldPassword : String!
            newPassword : String!
        }

        type UserComments {
            _id: ID!
            text: String
            time: String
            avatar: String
            username:String
            user : String
            likes : [String]
        }
        

        type Replied {
            _id: ID!
            text: String
            time: String
            user : String
            likes : [String]
        }


        
    type RootMutation {
            addComment(text : String! , video_id : String!) : UserComments
            addReplyToComment(text : String! , video_id : String! , comment_id : String!) : UserComments
            addLikeDislike(video_id : String!,comment_id : String!,userId : String!) : String!
            addNestedLikeDislike(video_id : String!,comment_id : String! , replied_comment_id : String! ,userId : String!) : String!
    }
    
    
    type RootQuery {
            users : [User!]!
            
    }
    
    schema {
            query : RootQuery
            mutation : RootMutation
    }
    
    `;

module.exports = makeExecutableSchema({
  typeDefs: commentTypeDefs,
});
