const {
  sendPaymentWithStripe,
  paymentWithWallet,
} = require("./CompaignPayment");
const objectId = require("mongodb").ObjectId;
const PaidVideo = require("../../models/PaidVideo");
const { deductionOfCommission } = require("../../helpers/walletPayment");

module.exports = {
  payforVideo: async (req, res) => {
    try {
      const {
        videoId,
        payerId,
        token,
        password,
        email,
        price,
        type,
      } = req.body;

      if (!videoId) {
        res.status(400).send({ message: "Token and Video Id is required" });
        res.end();
        return;
      } else {
        if (password !== "") {
          let walletPayment = await paymentWithWallet(
            email,
            parseInt(price),
            password
          );

          console.log("walletPayment ----", walletPayment);
          if (walletPayment.status) {
            const paidVideos = await PaidVideo.create({
              userId: req.user.id,
              payerId,
              paymentFor: type,
              paymentStatus: "succeeded",
              transactionId: "",
              transactionType: "Wallet",
              creditAomunt: deductionOfCommission(parseInt(price)),
              totalAmount: parseInt(price),
              debitAmount: 0,
              videoId,
              type: "credit",
            });

            if (paidVideos) {
              res
                .status(200)
                .send({ message: "Successfully Paid", paymentStatus: true });
              res.end();
              return;
            }
          } else {
            res
              .status(404)
              .send({ message: "Error in paying for Paid video", error });
            res.end();
            return;
          }
        } else {
          console.log("Stripe Payment for Paid Video");
          let stripePayment = await sendPaymentWithStripe(
            parseInt(price),
            token,
            "Vyzmo Paid Video"
          );

          console.log(
            "==== Stripe Payment for Paid Video ==== ",
            stripePayment
          );

          if (stripePayment.status) {
            const paidVideos = await PaidVideo.create({
              userId: req.user.id,
              payerId,
              paymentFor: type,
              paymentStatus: "succeeded",
              transactionId: stripePayment.id,
              transactionType: "Stripe",
              creditAomunt: deductionOfCommission(parseInt(price)),
              totalAmount: parseInt(price),
              debitAmount: 0,
              videoId,
              type: "credit",
            });
            if (paidVideos) {
              res.status(200).send({
                message: "Successfully Paid",
                paymentStatus: true,
                transactionId: stripePayment.id,
              });
              res.end();
              return;
            } else {
              res
                .status(404)
                .send({ message: "Error in paying for Paid video" });
              res.end();
              return;
            }
          } else {
            res.status(400).send({ message: stripePayment.message });
            res.end();
            return;
          }
        }
      }
    } catch (e) {
      console.log("-----", e);
      res.status(404).send({ message: e.message });
      res.end();
      return;
    }
  },
  getAllPaidVideos: async (req, res) => {
    try {
      console.log("=====req.user.id ,", req.user.id);
      const userId = req.user.id;

      if (!userId) {
        res.status(400).send({ message: "Token && userId is required" });
        res.end();
        return;
      } else {
        const paidVideos = await PaidVideo.aggregate([
          {
            $match: {
              payerId: new objectId(userId),
            },
          },
          {
            $project: {
              _id: 1,
              videoId: 1,
            },
          },
          {
            $lookup: {
              from: "videos",

              let: { video_Id: { $toObjectId: "$videoId" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$video_Id"],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    thumbnail: 1,
                    videoTitle: 1,
                    category: 1,
                    createdAt: 1,
                    realViews: 1,
                    downloads: 1,
                    share: 1,
                    userId: 1,
                    user_rating: {
                      $sum: {
                        $cond: {
                          if: { $gte: ["$reviewPoints.point", 0] },
                          then: "$reviewPoints.point",
                          else: 0,
                        },
                      },
                    },
                    average_rating: {
                      $avg: "$user_rating",
                    },
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$_id", "$$userId"],
                          },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          avatar: 1,
                          email: 1,
                          username: 1,
                          firstName: 1,
                          lastName: 1,
                        },
                      },
                    ],
                    as: "videoCreator",
                  },
                },
                {
                  $lookup: {
                    from: "videocomments",
                    let: { video__Id: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$videoId", "$$video__Id"],
                          },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                        },
                      },
                    ],
                    as: "comments",
                  },
                },
                {
                  $addFields: {
                    commentCounts: { $size: "$comments" },
                  },
                },
                {
                  $project: {
                    comments: 0,
                  },
                },
              ],
              as: "VideoDetails",
            },
          },
        ]);

        if (paidVideos?.length > 0) {
          paidVideos.forEach((paid) => {
            if (paid?.VideoDetails?.length > 0) {
              paid.VideoDetails = paid.VideoDetails[0];
              if (paid?.VideoDetails?.videoCreator?.length > 0) {
                paid.VideoDetails.userId = paid?.VideoDetails?.videoCreator[0];
              }
            }
          });
          res.status(200).send({ paidVideos });
          res.end();
          return;
        } else {
          res.status(200).send({ paidVideo: [] });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log("-----", e);
      res.status(404).send({ message: e.message });
      res.end();
      return;
    }
  },
  checkPaidVideo: async (req, res) => {
    try {
      let { videoId, userId } = req.query;
      // const userId = req.user.id;

      if (!userId) userId = "000000000000";
      if (!(videoId && userId)) {
        res
          .status(400)
          .send({ message: "Token, Video Id && userId is required" });
        res.end();
        return;
      } else {
        const paidVideoStatus = await PaidVideo.findOne({
          videoId: videoId.toString(),
          payerId: userId.toString(),
        });

        if (paidVideoStatus?._id) {
          res.status(200).send({ paidVideo: true });
          res.end();
          return;
        } else {
          res.status(200).send({ paidVideo: false });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log("-----", e);
      res.status(404).send({ message: e.message });
      res.end();
      return;
    }
  },
};
