const { makeExecutableSchema } = require("graphql-tools");

const compaignTypeDefs = `

type Campaign {
    _id : ID
    type : String
    name : String
    email : String
    password : String
    compaign_strategy : StrategyType
    budget : BudgetType
    location : [String]
    languages : [String]
    gender : [String]
    parental_status : [String]
    age : [String]
    keywords : [String]
    token : String
    stripeId : String
    ad_creation : AddCreationType
    billing : BillingType
    status : String
    createdAt : String
    
}


type BillingType {
    country : String
    time_zone : String
    promo_code : String
    billing_address : String
    credit_card : String
    name : String
    expiry : String
    cvc : String
}

type AddCreationType {
    search_ad_preview : SearchAdType
    display_ad : FeatureAndDisplayType
    feature_carousel : FeatureAndDisplayType
    video_ad : VideoAdType
    featured_ad :FeatureAdType
}

type VideoAdType {
    ad_type :String
    video_url :String
    site_url :String
}

type FeatureAndDisplayType {
        main_view : String
        logo : String
        headline : String
        description : String
        site_url :String
}

type SearchAdType {
    headline1:String
    headline2:String
    headline3:String
    site_url:String
    description:String
}


type BudgetType {
    country : String
    total_budget_amount : Int
    daily_budget_amount : Int
    start_date : String
    end_date : String
    payment_method : String
}

type StrategyType {
    clicks : Int
    impression_share : Int
}

input InputCompaign {
    type : String
    name : String
    email : String
    password : String
    token : String
    stripeId : String
    compaign_strategy : Strategy
    budget : Budget
    location : [String]
    languages : [String]
    gender : [String]
    parental_status : [String]
    age : [String]
    keywords : [String]
    ad_creation : AddCreation
    billing : Billing
    status : String
}


input Billing {
    country : String
    time_zone : String
    promo_code : String
    billing_address : String
    credit_card : String
    name : String
    expiry : String
    cvc : String
}

input AddCreation {
    search_ad_preview : SearchAd
    display_ad : FeatureAndDisplay
    feature_carousel : FeatureAndDisplay
    video_ad : VideoAd
    featured_ad :FeatureAd
}

input VideoAd {
    ad_type :String
    video_url :String
    site_url :String
}

input FeatureAndDisplay {
        main_view : String
        logo : String
        headline : String
        description : String
        site_url :String
}

input FeatureAd{
    main_view : String
    logo : String
    headline : String
    description : String
    site_url :String
}

type FeatureAdType{
    main_view : String
    logo : String
    headline : String
    description : String
    site_url :String
}

input SearchAd {
    headline1:String
    headline2:String
    headline3:String
    site_url:String
    description:String
}


input Budget {
    country : String
    total_budget_amount : Int
    daily_budget_amount : Int
    start_date : String
    end_date : String
    payment_method : String
}

input Strategy {
    clicks : Int
    impression_share : Int
}

type RootMutation {
    createCampaign(obj : InputCompaign) : String!

}
type RootQuery {
    compaigns(type : String!): [Campaign]
    compaign(id : String) : [Campaign]   
}
schema {
        query : RootQuery
        mutation : RootMutation
}
`;

module.exports = makeExecutableSchema({
  typeDefs: compaignTypeDefs,
});
