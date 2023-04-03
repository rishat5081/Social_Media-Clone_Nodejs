const { makeExecutableSchema } = require("graphql-tools");

const galleryTypeDefs = `

          type Gallery {
              _id : ID
              title : String
              imageUrl : String
              date: String
              description : String
              userId : UserRef
              comments : [Comment]
              views : Int
              share : Int
              createdAt : String
              like_count : Int
              following_count : Int
              am_i_followed : Boolean
              average_rating : Float
              is_like : Boolean
              is_dislike : Boolean
              dislike_count : Int
              total_comments : Int
          }





            type Comment {
                userId : UserRef
                text : String
                _id : ID
                time : String
                reply : [Replied]
                is_liked : Boolean
                total_likes : Int
                total_replies : Int
            }


            type ImageComment {
                _id: ID!
                text: String
                time: String
                user : String
                likes : [String]
            }

            type Replied {
                _id: ID
                text: String
                time: String
                userId : UserRef
                likes : [String]
                is_liked : Boolean
                total_likes : Int
            }

            type UserRef {
                username : String
                _id : ID
                avatar : String
                firstName : String
                lastName : String
            }


            input inputGallery {
                title : String!
                imageUrl : String!
                description : String!
                date: String!
            }



            type User {
                username : String
                avatar : String
                createdAt : String
                realViews : String
            }

          type RootMutation {
              createImage(fields : inputGallery) : Gallery
              deleteUserImage(image_id : String!) : String!
              addShareToImage(image_id : String!) : String!
              addCommentToImage(text : String! , image_id : String!) : ImageComment
              addReplyToImageComment(text : String! , image_id : String! , comment_id : String!) : ImageComment
              addLikeDislikeToImageComment(image_id : String!,comment_id : String!) : Int!
              addNestedLikeDislikeToImageCommentReply(image_id : String!,comment_id : String! , replied_comment_id : String!) : Int!
          }


          type RootQuery {
              gallery(user_id : String!) : [Gallery]
              image(image_id : String!) : Gallery
              getImageRepliesOfComment (image_id : String! , comment_id : String!) : [Replied]
          }

          schema {
              query : RootQuery
              mutation : RootMutation
          }
          `;

module.exports = makeExecutableSchema({
  typeDefs: galleryTypeDefs
});
