const { makeExecutableSchema } = require("graphql-tools");

const articleTypesDef = `

type Articles {
    _id : ID!
    theArticle : String
    title : String!
    category : String!
    imageUrl : String!
    description : String
    userId : UserRef
    comments : [Comment]
    views : Int
    share : Int
    createdAt : String!
    like_count : Int
    following_count : Int
    am_i_followed : Boolean
    average_rating : Float
    is_like : Boolean
    is_dislike : Boolean
    dislike_count : Int
    tags : [String]
}




type Article {
    _id : ID!
    theArticle : String!
    title : String!
    category : String!
    imageUrl : String!
    description : String!
    time : String!
    userId : UserRef

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
    likes : [String]
}


type ArticleComment {
        _id: ID!
        text: String
        time: String
        user : String
        likes : [String]
}

type Replied {
    _id: ID!
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


input inputArticle {
    theArticle : String!
    title : String!
    category : String!
    imageUrl : String!
    tags : [String]
    description : String!

}



input articleId {
    id : String!
}

type Object {
    userId : User
    articles : [Article]

}
type User {
    username : String
    avatar : String
    createdAt : String
    realViews : String
}


input editArticle {
    theArticle : String
    title : String
    category : String
    imageUrl : String
    description : String
    articleId : String
    tags : [String]
}





type RootMutation {
    createArticle(fields : inputArticle) : String!
    addArticleView(article_id : String!) : String
    editArticle(editedArticle : editArticle) : String!
    addCommentToArticle(text : String! , article_id : String!) : ArticleComment
    addReplyToCommentArticle(text : String! , article_id : String! , comment_id : String!) : ArticleComment
    addLikeDislikeToArticle(article_id : String!,comment_id : String!,userId : String!) : String!
    addNestedLikeDislikeArticleComment(article_id : String!,comment_id : String! , replied_comment_id : String! ,userId : String!) : String!
    deleteUserArticle(article_id : String!) : String!
    addLikeToArticle(article_id : String!) : String!
    addDislikeToArticle(article_id : String!) : String!
    shareArticle(id : String!) : String

}


type RootQuery {
        articles(user_id : String!) : [Articles]
        article(article_id : String!) : Articles
        relatedArticles(title : String!) : [Object]
        relatedWatchArticles(title : String!) : [Articles]
        searchArticles(title : String!) : [Articles]
        getAllArticles : [Articles]
        getArticleRepliesOfComment (article_id : String! , comment_id : String!) : [Replied]

}

schema {
        query : RootQuery
        mutation : RootMutation
}
`;

module.exports = makeExecutableSchema({
  typeDefs: articleTypesDef
});
