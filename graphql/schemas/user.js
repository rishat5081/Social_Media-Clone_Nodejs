const { makeExecutableSchema } = require("graphql-tools");

const userTypeDefs = `

    type User {
            _id : ID
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
            token : String
            donationPaypalEmail : String
            rating : [Rating]
            twoFactorAuthentication : String
            followBy : [followByDoc]
            am_i_followed : Boolean
            sideBarAvatar : String!
            vyzmo_id : Int
        }
        type followByDoc {
            userId : ID!
        }


        type Rating {
            userId : String!
            points : Float!
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
            backgroundCover : String
            code : Int
            vyzmo_id : Int
            location : String

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
            backgroundCover : String
            donationPaypalEmail : String
        }

        input PasswordEdit {
            oldPassword : String!
            newPassword : String!
            forgot : Boolean
        }

        type LoginUser {
            _id : ID
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
            token : String
            donationPaypalEmail : String
            Rating : [Rating]
            twoFactorAuthentication : String
            code : Int
            sideBarAvatar : String
            vyzmo_id : Int
        }

        type Notification {
            count : Int
            notifications : [Notify]
        }
        type Notify {
            _id : ID!
            actionTitle : String!
            user_id : ID!
            time : String
            avatar : String
            username : String
            isRead : Boolean
            type : String
        }


        type responseObject {
            status: Boolean!
            message: String!
          }


    type RootMutation {
            registerUser(userCredentials : UserRegistration) : responseObject
            loginUser(loginCredentials : UserLogin) : LoginUser
            editUser(editedUser : UserEdit) : User
            editPassword(editedPassword : PasswordEdit) : String!
            updateAvatar(url : String!) : User
            postUserRating(userId : String! , ratingPoint : String!) : String!
            relatedProfiles(username : String!) : [User]
            deleteUserAccount(password : String!) : String!
            addUserReview(point : String! , userId : String!) : String
            deleteUserGalleryImage(image_id : String!) : String!
            onOffTwoFactorAuthentication(isOn : String!) : String!
            forgotUserPasscode (email : String!) : String!
            seenNotifications : String!
            verifyToken(token : String!) : String
            updateSidebarAvatar(sidebar_avatar : String!) : String!
            contactUs(firstName : String! , lastName : String! , email : String! , message: String! ) : String!
     }


    type RootQuery {
            users : [User!]!
            user(friendId : [String]!) : [User]
            getUserById(id : String!) : LoginUser
            getUserFromId(user_id : String!) :  User

    }

    schema {
            query : RootQuery
            mutation : RootMutation
    }
    `;

module.exports = makeExecutableSchema({
  typeDefs: userTypeDefs,
});
