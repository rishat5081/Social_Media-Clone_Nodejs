const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampaignSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Search", "Video", "App", "Display", "Featured"],
    },
    name: {
      type: String,
      required: true,
    },
    compaign_strategy: {
      clicks: {
        number_of_clicks: Number,
      },
      impression_share: {
        ads_appear_to: String,
        percentage: Number,
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "aduser",
      required: true,
    },

    token: {
      type: String,
      required: false,
    },
    stripeId: {
      type: String,
      required: false,
    },
    budget: {
      country: {
        type: String,
        required: false,
      },
      total_budget_amount: {
        type: Number,
        required: false,
      },
      daily_budget_amount: Number,
      payment_method: {
        type: String,
        enum: ["Automatic", "Manual", "Other"],
        required: false,
      },
      start_date: {
        type: String,
        required: false,
      },
      end_date: {
        type: String,
        required: false,
      },
    },
    location: {
      type: Array,
      required: false,
    },
    languages: {
      type: Array,
      required: false,
    },
    gender: {
      type: Array,
      required: false,
    },
    parental_status: {
      type: Array,
      required: false,
    },
    age: {
      type: Array,
      required: false,
    },
    keywords: {
      type: Array,
      required: false,
    },
    ad_creation: {
      search_ad_preview: {
        headline1: String,
        headline2: String,
        headline3: String,
        site_url: String,
        description: String,
      },
      display_ad: {
        main_view: String,
        logo: String,
        headline: String,
        description: String,
        site_url: String,
      },
      feature_carousel: {
        main_view: String,
        logo: String,
        headline: String,
        description: String,
        site_url: String,
      },
      video_ad: {
        video_url: String,
        site_url: String,
        ad_type: String,
      },
      featured_ad: {
        main_view: String,
        logo: String,
        headline: String,
        description: String,
        site_url: String,
      },
    },
    billing: {
      country: {
        type: String,
        required: false,
      },
      time_zone: {
        type: String,
        required: false,
      },
      promo_code: {
        type: String,
        required: false,
      },
      billing_address: {
        type: String,
        required: false,
      },
      credit_card: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      expiry: {
        type: String,
        required: false,
      },
      cvc: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      required: false,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("campaign", CampaignSchema);
