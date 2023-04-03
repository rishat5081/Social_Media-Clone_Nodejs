const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLUpload } = require("graphql-upload");

const videoTypeDefs = `
            input Upload {
                name : String
            }

            type Quality {
                twoFourty : String
                threeSixty : String
                fourEighty : String
                sevenTwenty : String
                tenEighty : String
            }
            type CatVideo {
                _id : ID
                videoTitle : String
                videoDescription : String
                originalVideo : String
                category : String
                qualities : Quality
                avatar : String
                thumbnail : String
                comments : [Comment]
                createdAt : String
                userId : UserRef
                profileViews : [Fingerprint!]
                reviewPoints : [Rating]
                user_rating : Float
                realViews : Int
                share : Int
                downloads : Int
                isLiked : Boolean
                like_count : Int
                following_count : Int
                am_i_followed : Boolean
                average_rating : Float
                total_likes : Int
                likes : [VideoLike]
                tags : [String]
                ageRestriction : String
                privacy : String
                geoLocation : String
                isPremier : Boolean
                isPaid : Boolean
                priceOfVideo : Int
            }



            type VideobyIdTesting {
              _id : ID
              videoTitle : String
              videoDescription : String
              originalVideo : String
              category : String
              qualities : Quality
              avatar : String
              thumbnail : String
              comments : [User_Comments]
              createdAt : String
              userId : ID
              profileViews : [Fingerprint!]
              reviewPoints : [VideoReviewPoints]
              user_rating : Float
              realViews : Int
              share : Int
              downloads : Int
              isLiked : Boolean
              like_count : Int
              average_rating : Float
              tags : [String]
              ageRestriction : String
              privacy : String
              videoCreatorData:[UserRefernece]
              followersData:[Followers]
              following_count : Int
              am_i_followed : Boolean
              isPremier : Boolean
              isPaid : Boolean
              priceOfVideo : Int
          }



          type VideobyIdInDev {
            _id : ID
            videoTitle : String
            videoDescription : String
            originalVideo : String
            category : String
            qualities : Quality
            avatar : String
            thumbnail : String
            comments : [User_Comments]
            createdAt : String
            userId : ID
            profileViews : [Fingerprint!]
            reviewPoints : [VideoReviewPoints]
            user_rating : Float
            realViews : Int
            share : Int
            downloads : Int
            isLiked : Boolean
            likes_count : Int
            average_rating : Float
            tags : [String]
            ageRestriction : String
            privacy : String
            videoCreatorData:[UserRefernece]
            followersData:[Followers]
            isPremier : Boolean
            isPaid : Boolean
            priceOfVideo : Int
        }




          type LikesonVideo {
            userId : String
          }
          type CommentUserInfo{
            _id:ID
            firstname:String
            lastName:String
            username:String
            email:String
            avatar:String
            total_likes:Int
            is_liked:Boolean
          }
          type UserCommentLikes {
            total_likes : Int
            username : String
            _id : ID
            avatar : String
            is_liked : Boolean
          }

          type Followers{
            _id : ID
            followers:Int
            am_i_followed : Boolean
            followBy:[FollowByUsers]
          }

          type FollowByUsers {
            _id : ID
            userId : String
        }
          type UserComment {
            userId : UserRefernece
            likes:[CommentLikes]
            text : String
            _id : ID
            time : String
            reply : [UserReplied]
            is_liked : Boolean
            total_likes : Int
            total_replies : Int
           }


           type User_Comments {
            userId : UserRefernece
            likes:CommentLikes
            text : String
            _id : ID
            time : String
            reply : [UserReplied]
            is_liked : Boolean
            total_likes : Int
            total_replies : Int
           }

           type UserRefernece {
            username : String
            firstName : String
            lastName : String
            _id : ID
            avatar : String
            email : String
           }

           type UserReplied {
            _id: ID
            text: String
            time: String
            commentId: String
            userId : UserRefernece
            likes : [String]
            is_liked : Boolean
            total_likes : Int
          }


          type VideoReviewPoints{
            _id:ID
            userId:String
            point:Float
          }


          type CommentLikes{
            userId:String
          }



          type RepliesOfComments{
            _id:ID
            comments : [User_Comments]

          }
          type VideoLike {
              userId : String
            }


            type Fingerprint {
                fingerprint : String!
                _id : ID!
            }

            type UserRef {
                username : String
                _id : ID
                avatar : String
                email : String
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


          type Replied {
            _id: ID
            text: String
            time: String
            userId : UserRef
            likes : [String]
            is_liked : Boolean
            total_likes : Int
          }
          type Rating {
              userId : String!
              _id : ID
              point : Float
          }


                input EditVideo {
                    id : String!
                    videoTitle : String
                    videoDescription : String
                    category : String
                    privacy : String
                    ageRestriction : String
                    tags : [String]
                    geoLocation : String
                    price : Int
                    isFeatureVideo : Boolean
                    thumbnail : String
                }


                type Playlist {
                    name : String
                    user_playlist : UserRef
                    playlist : [playObj]
                    _id : ID!
                    privacy : String
                }

                type playObj {
                    playlist_video_id : Video
                    privacy : String!
                }

                type Video {
                    videoTitle : String
                    realViews : String
                    createdAt : String
                    _id : ID
                    thumbnail : String
                    userId : UserRef
                    average_rating : Float
                }


                type History{
                    user_fingerprint : String
                    history : [HistoryVideos]

                }

                type HistoryVideos{
                    history_video_id : Video
                    createdAt : String
                }


                type PremierVideo{
                  _id:ID
                  videoTitle:String
                  thumbnail:String
                  userId:UserRefernece
                }

                input deleteVideoHistory{
                    videoId : String!
                    fingerprint : String!
                }

                type RootMutation {
                    uploadVideo(file : Upload) : String
                    realViews(id : String!) : String
                    shareVideo(id : String!) : String
                    profileViews(id : String! , fingerprint : String!) : String
                    addReviewPoints(point : String! , userId : String! , video_id : String!) : String
                    deleteVideo(id : String!) : String!
                    editVideo(editVideo : EditVideo) : String!
                    addvideoToPlaylist(videoId : String!  , name : String! , privacy : String!) : String!
                    removevideoFromPlaylist(videoId : String! , playlist_id : String!) : String!
                    addVideoToHistory(videoId : String! , fingerprint : String!) : String!
                    removeVideoToHistory(videoHoistory :[deleteVideoHistory]) : History
                    addDownloadVideoSuccess(id : String!) : String
                    unlikeVideo(id : String!) : String!
                    addLikeToVideo(id : String!) : String!
                    readNotification(notification_id : String!) : String!
                }


                type RootQuery {
                    getUserVideos : String!
                    getPremierVideos : [PremierVideo]
                    videos (limit : Int!) : [CatVideo]!
                    videosByCategory(category : String!) : [CatVideo]!
                    videoById(id : String!) : VideobyIdTesting
                    videoByIdDevTesting(id : String!) : VideobyIdInDev
                    relatedWatchVideos(title : String! , limit : Int) : [CatVideo]!
                    getAllUserVideos(id : String!) : [CatVideo]
                    getAllUserVideosByRating(id : String!) : [CatVideo]
                    getSearchVideos(title : String!, limit: Int, , skip: Int) : [CatVideo]
                    getUserPlaylistVideos(is_me : Boolean! , user_id : String!) : [Playlist]
                    getUserHistoryVideos(fingerprint : String!) : History
                    getFeatureVideos : [CatVideo]!
                    getTopViewersUser : [CatVideo]
                    getTopDownloadersUser : [CatVideo]
                    getTopSharesUser : [CatVideo]
                    getAllTrendingVideos : [CatVideo]
                    getRepliesOfComment (video_id : String! , comment_id : String!) : RepliesOfComments
                    getVisitorPlaylistVideos(visitor_id : String!) :  [Playlist]

                }

                schema {
                        query : RootQuery
                        mutation : RootMutation
                }
`;

module.exports = makeExecutableSchema({
  typeDefs: videoTypeDefs,
});

// const aa = {
//   data: {
//     videoById: {
//       _id: "621c70cbd53d011ad2797a92",
//       videoTitle: "Faslon ko Takalluf Hai humse Agar - Qari Waheed Zafar Qasmi",
//       originalVideo:
//         "https://vyzmoer-videos.s3.eu-central-1.amazonaws.com/-320-video-1646031040839.mp4",
//       realViews: 3,
//       thumbnail: "https://vyzmoer-thumbnails.s3.amazonaws.com/136793tn.png",
//       videoDescription: "naat",
//       category: "Film Animation",
//       share: 0,
//       downloads: 0,
//       createdAt: "1646031051761",
//       am_i_followed: false,
//       reviewPoints: [
//         {
//           userId: "620baebb710f5b3a65acca95",
//           _id: "621dbcbc2600362a882f72af",
//           point: 5,
//           __typename: "Rating",
//         },
//       ],
//       likes: [],
//       profileViews: [],
//       userId: {
//         _id: "620baeb8710f5b3a65acca84",
//         username: null,
//         avatar: null,
//         __typename: "UserRef",
//       },
//       qualities: {
//         twoFourty:
//           "https://vyzmoer-videos.s3.eu-central-1.amazonaws.com/video-1646031040839-240.mp4",
//         threeSixty: null,
//         fourEighty: null,
//         sevenTwenty: null,
//         tenEighty: null,
//         __typename: "Quality",
//       },
//       comments: [],
//       __typename: "CatVideo",
//     },
//   },
// };

// const aaaa = {
//   errors: [
//     {
//       message:
//         'String cannot represent value: { userId: "620baeba710f5b3a65acca91" }',
//       locations: [
//         {
//           line: 53,
//           column: 7,
//         },
//       ],
//       path: ["videoById", "comments", 0, "likes", 0],
//     },
//   ],
//   data: {
//     videoById: {
//       _id: "6215ee85195f4bd8e7eacbab",
//       videoTitle: "Music",
//       originalVideo:
//         "https://vyzmoer-videos.s3.amazonaws.com/-1280-video-1645604481828.mp4",
//       realViews: 63,
//       thumbnail: "https://vyzmoer-thumbnails.s3.amazonaws.com/908829tn.png",
//       videoDescription: "Music for all",
//       category: "Music",
//       share: 0,
//       downloads: 0,
//       createdAt: "1645604485206",
//       am_i_followed: false,
//       reviewPoints: [
//         {
//           userId: "620baeba710f5b3a65acca91",
//           _id: "621628dc4687111cb0238743",
//           point: 4,
//           __typename: "Rating",
//         },
//       ],
//       likes: [],
//       profileViews: [],
//       userId: {
//         _id: "620baeb8710f5b3a65acca84",
//         username: null,
//         avatar: null,
//         __typename: "UserRef",
//       },
//       qualities: {
//         twoFourty:
//           "https://vyzmoer-videos.s3.eu-central-1.amazonaws.com/video-1645604481828-240.mp4",
//         threeSixty:
//           "https://vyzmoer-videos.s3.eu-central-1.amazonaws.com/video-1645604481828-360.mp4",
//         fourEighty:
//           "https://vyzmoer-videos.s3.eu-central-1.amazonaws.com/video-1645604481828-480.mp4",
//         sevenTwenty: null,
//         tenEighty: null,
//         __typename: "Quality",
//       },

//       comments: [
//         {
//           _id: "621628476400d604b8004b01",
//           time: "1645619271611",
//           userId: {
//             _id: "620baeba710f5b3a65acca91",
//             username: null,
//             avatar: null,
//             __typename: "UserRef",
//           },
//           likes: [null],
//           text: "comment",
//           reply: [
//             {
//               _id: "621628a077248324a433f1a8",
//               text: "replying",
//               time: "1645619360815",
//               userId: {
//                 _id: "620baeba710f5b3a65acca91",
//                 username: null,
//                 avatar: null,
//                 __typename: "UserRef",
//               },
//               likes: [],
//               __typename: "Replied",
//             },
//           ],
//           __typename: "Comment",
//         },
//       ],
//       __typename: "CatVideo",
//     },
//   },
// };
