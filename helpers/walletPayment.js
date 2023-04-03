const VyzmoWallet = require("../models/VyzmoWallet");
const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = {
  validateUserPassword: (email, password) => {
    return new Promise(async (resolve, rejected) => {
      let userPassword = await User.findOne(
        {
          email,
        },
        { password: 1, _id: 1 }
      );

      //here checking if the userId did have the password than
      //   move ahead and compare it using the bcrypt
      console.log("userPassword ", userPassword);
      if (userPassword.password) {
        //checking if the user password is match with bcrypt
        const bcryptStatus = await bcrypt.compareSync(
          password,
          userPassword.password
        );
        if (bcryptStatus)
          resolve({
            status: true,
            message: "Password is Correct",
            userId: userPassword._id,
          });
        else resolve({ status: false, message: "Incorrect Password" });
      } else {
        resolve({ status: false, message: "User Password not found" });
      }
    });
  },
  walletHaveEnoghtAmountForThisTrasections: (user_id, amount) => {
    return new Promise(async (resolve, rejected) => {
      let paymentCount = await VyzmoWallet.countDocuments({
        userId: user_id,
        totalAmount: { $gte: amount },
      });

      console.log("paymentCount :", paymentCount);

      if (paymentCount > 0) {
        resolve({ status: true, message: "Balance is Available" });
      } else {
        resolve({ status: false, message: "Balance is not enough" });
      }
    });
  },

  chargeThePaymentFromUser: (user_id, amount) => {
    return new Promise(async (resolve, rejected) => {
      let subtractAmount = await VyzmoWallet.updateOne(
        { userId: user_id },
        { $inc: { totalAmount: -amount } }
      );

      if (subtractAmount)
        resolve({ status: true, message: "Amount Deducted from User Account" });
      else resolve({ status: false, message: "Error in Charging the account" });
    });
  },

  transferAmountToAdmin: (amount) => {
    return new Promise(async (resolve) => {
      let addAmountToAdmin = await VyzmoWallet.updateOne(
        { userId: "61d6bdc00b936a2cf96de2ca" },
        { $inc: { totalAmount: +amount } }
      );

      if (addAmountToAdmin)
        resolve({ status: true, message: "Amount Credited to Admin Account" });
      else
        resolve({ status: false, message: "Error Crediting to Admin Account" });
    });
  },
  deductionOfCommission: (amount) => {
    let amountPay = Number(amount);
    let commissionPecent = 10;
    let commissionAmount = (commissionPecent / 100) * amountPay;
    let amountAfterCommission = amountPay - commissionAmount;
    return amountAfterCommission;
  },
};
