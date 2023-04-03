const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51KbeZFKw8NlufAejHx1ibv7QxpVAqWbXmCPLrqiNIcSvGCTVECWCvsvczwKfIvbppiRlbuzMKKvWIyWYrnKPGm5K00Ed53F0ZW"
); // Secret Key

const {
  validateUserPassword,
  walletHaveEnoghtAmountForThisTrasections,
  chargeThePaymentFromUser,
  transferAmountToAdmin
} = require("../../helpers/walletPayment");
module.exports = {
  sendPaymentWithStripe: (amount, token, description) => {
    return new Promise((resolve, rejected) => {
      stripe.charges
        .create({
          amount: amount * 100,
          currency: "USD",
          source: token,
          metadata: { token: token, amount: amount },
          description: description
        })
        .then(async charge => {
          // console.log("Stripe ------>", charge);
          if (charge.status == "succeeded")
            resolve({ status: true, id: charge.id });
          else rejected(false);
        })
        .catch(e => {
          console.log("=======STRIPE ===============", e.raw.message);
          rejected({ status: false, message: e.raw.message });
        });
    });
  },
  paymentWithWallet: async (email, amount, password) => {
    if (!email) return { status: false, message: "Email is required" };
    else {
      const passwordChecked = await validateUserPassword(email, password);

      //here it will be an nested checks one by one
      // first password comparison
      // balance checking
      // balance deduction
      // transfer to admin account
      //console.log("passwordChecked :", passwordChecked);
      if (passwordChecked.status) {
        const userBalanceChecked = await walletHaveEnoghtAmountForThisTrasections(
          passwordChecked.userId,
          amount
        );

        console.log("userBalanceChecked ---", userBalanceChecked);
        if (userBalanceChecked.status) {
          const chargeUserAccount = await chargeThePaymentFromUser(
            passwordChecked.userId,
            amount
          );

          console.log("chargeUserAccount ---", chargeUserAccount);
          if (chargeUserAccount.status) {
            const creditToAdminAccount = await transferAmountToAdmin(amount);

            console.log("creditToAdminAccount ---", creditToAdminAccount);
            if (creditToAdminAccount.status) return creditToAdminAccount;
            else creditToAdminAccount;
          } else return userBalanceChecked;
        } else return userBalanceChecked;
      } else return passwordChecked;
    }
  }
};
