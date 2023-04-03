const Campaign = require("../../models/Campaign");
const { errorName } = require("../error/constants");
const _ = require("lodash");

const {
  sendPaymentWithStripe,
  paymentWithWallet
} = require("./CompaignPayment");

module.exports = {
  createCampaign: async ({ obj }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) return new Error(errorName.BAD_REQUEST);

      obj.userId = user.id;
      if (obj.password) {
        let walletPayment = await paymentWithWallet(
          obj.email,
          obj.budget.total_budget_amount,
          obj.password
        );
        if (walletPayment.status) {
          await Campaign.create(obj);
          return "Created Campaign Success";
        } else {
          return new Error(errorName.BAD_REQUEST);
        }
      } else {
        let stripePayment = await sendPaymentWithStripe(
          obj.budget.total_budget_amount,
          obj.token,
          "Vyzmo Ad Payment"
        );

        if (stripePayment) {
          obj.stripeId = stripePayment;
          await Campaign.create(obj);
          return "Created Campaign Success";
        } else {
          return "Error Creating Campaign";
        }
      }
    } catch (err) {
      console.log(
        "🚀 ~ file: compaign.js ~ line 18 ~ createCompaign: ~ err",
        err
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },

  compaigns: async ({ type }, ctx) => {
    try {
      let compaigns = await Campaign.find({ type });
      return compaigns;
    } catch (err) {
      console.log("🚀 ~ file: compaign.js ~ line 33 ~ compaigns: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  compaign: async ({ id }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) return new Error(errorName.BAD_REQUEST);

      let compaign = await Campaign.find({ userId: id });
      return compaign;
    } catch (err) {
      console.log("🚀 ~ file: compaign.js ~ line 33 ~ compaigns: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  }
};
