const { makeExecutableSchema } = require("graphql-tools");

const notificatioinsTypeDefs = `

    type Notifcations {
            _id : ID!
            notification_user_id : ID
            count:Int
            notifications:[notificationDetails]
        }


        type notificationDetails {
            _id : ID!
            isRead : Boolean
            type : String!
            actionTitle : String!
            phoneNumber : String
            user_id : ID!
            time : String
            avatar : String
            username : String
            videoId : ID
        }


    type RootQuery {
        GetAllNotifications(userId : String) : Notifcations!

    }

    schema {
        query : RootQuery
    }    `;

module.exports = makeExecutableSchema({
  typeDefs: notificatioinsTypeDefs
});
