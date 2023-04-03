const VyzmoWallet = require("../../models/VyzmoWallet");

module.exports = {
  getWalletBalance: async (req, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(400).send({ status: false, message: "UserId is required" });
        res.end();
        return;
      } else {
        const wallet = await VyzmoWallet.findOne({
          userId,
        });
        if (wallet?._id) {
          res.status(200).send({ status: true, balance: wallet.totalAmount });
          res.end();
          return;
        } else {
          res.status(400).send({
            status: false,
            message: "Not Wallet found against this userId",
          });
          res.end();
          return;
        }
      }
    } catch (e) {
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
};
