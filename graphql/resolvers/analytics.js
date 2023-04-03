const Video = require("../../models/Video");
const objectId = require("mongodb").ObjectId;
const { errorName } = require("../error/constants");
module.exports = {
  videoAnalytics: async ({ userId }) => {
    if (!userId) return new Error(errorName.BAD_REQUEST);
    let previousStartingDate = `${new Date().getFullYear()}-0${new Date().getMonth()}-01T00:00:00.000Z`,
      previousEndingDate = `${new Date().getFullYear()}-0${new Date().getMonth()}-${daysInMonth(
        new Date().getMonth(),
        new Date().getFullYear()
      )}T23:59:59.000Z`;

    let startingDate = `${new Date().getFullYear()}-0${
        new Date().getMonth() + 1
      }-01T00:00:00.000Z`,
      endingDate = `${new Date().getFullYear()}-0${
        new Date().getMonth() + 1
      }-${daysInMonth(
        new Date().getMonth(),
        new Date().getFullYear()
      )}T23:59:59.000Z`;

    const previousMonthQuery = [
      { $unwind: "$comments" },
      { $unwind: "$likes" },
      {
        $match: {
          "comments.time": {
            $gte: new Date(previousStartingDate),
            $lte: new Date(previousEndingDate),
          },
          userId: new objectId(userId),
        },
      },
      {
        $project: {
          _id: 1,
          comments: { $strLenCP: "$comments.text" },
          likes: 1,
          realViews: 1,
          share: 1,
          downloads: 1,
        },
      },
      {
        $group: {
          _id: null,
          previousMonthCountComments: {
            $sum: {
              $cond: {
                if: {
                  $gte: ["$comments", 0],
                },
                then: 1,
                else: 0,
              },
            },
          },
          previousMonthCountLikes: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$likes.userId", null],
                },
                then: 0,
                else: 1,
              },
            },
          },
          previousMonthCountViews: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$realViews", 0],
                },
                then: 0,
                else: "$realViews",
              },
            },
          },
          previousMonthCountShares: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$share", 0],
                },
                then: 0,
                else: "$share",
              },
            },
          },
          previousMonthCountDownloads: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$downloads", 0],
                },
                then: 0,
                else: "$downloads",
              },
            },
          },
        },
      },
    ];

    const currentMonthQuery = [
      { $unwind: "$comments" },
      { $unwind: "$likes" },
      {
        $match: {
          "comments.time": {
            $gte: new Date(startingDate),
            $lte: new Date(endingDate),
          },
          userId: new objectId(userId),
        },
      },
      {
        $project: {
          _id: 1,
          // length: { $strLenCP: "$comments.text" },
          comments: { $strLenCP: "$comments.text" },
          likes: 1,
          realViews: 1,
          share: 1,
          downloads: 1,
        },
      },
      {
        $group: {
          _id: null,
          currentMonthCount: {
            $sum: {
              $cond: {
                if: {
                  $gte: ["$length", 0],
                },
                then: 1,
                else: 0,
              },
            },
          },
          currentMonthCountLikes: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$likes.userId", null],
                },
                then: 0,
                else: 1,
              },
            },
          },
          currentMonthCountViews: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$realViews", 0],
                },
                then: 0,
                else: "$realViews",
              },
            },
          },
          currentMonthCountShares: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$share", 0],
                },
                then: 0,
                else: "$share",
              },
            },
          },
          currentMonthCountDownloads: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$downloads", 0],
                },
                then: 0,
                else: "$downloads",
              },
            },
          },
        },
      },
    ];

    const previousMonthResponse = await Video.aggregate(previousMonthQuery);
    const currentMonthResponse = await Video.aggregate(currentMonthQuery);

    let commentPercentage =
      (likesPercentage =
      viewsPercentage =
      sharePercentage =
      downloadsPercentage =
        0);
    //checking if the response of the previous data in available than go with calculations of average
    if (previousMonthResponse.length > 0) {
      const {
        previousMonthCountComments,
        previousMonthCountLikes,
        previousMonthCountViews,
        previousMonthCountShares,
        previousMonthCountDownloads,
      } = previousMonthResponse[0];

      if (currentMonthResponse.length > 0) {
        const {
          currentMonthCount,
          currentMonthCountLikes,
          currentMonthCountViews,
        } = currentMonthResponse[0];

        commentPercentage = calculatePercentage(
          currentMonthCount,
          previousMonthCountComments
        );
        likesPercentage = calculatePercentage(
          currentMonthCountLikes,
          previousMonthCountLikes
        );
        viewsPercentage = calculatePercentage(
          currentMonthCountViews,
          previousMonthCountViews
        );

        sharePercentage = calculatePercentage(
          currentMonthCountViews,
          previousMonthCountShares
        );
        downloadsPercentage = calculatePercentage(
          currentMonthCountViews,
          previousMonthCountDownloads
        );
      } else {
        finalPercentage = 0;
      }
    } else {
      if (currentMonthResponse.length > 0) {
        const {
          currentMonthCount,
          currentMonthCountLikes,
          currentMonthCountViews,
        } = currentMonthResponse[0];

        commentPercentage = calculatePercentage(currentMonthCount, 0);
        likesPercentage = calculatePercentage(currentMonthCountLikes, 0);
        viewsPercentage = calculatePercentage(currentMonthCountViews, 0);
        sharePercentage = calculatePercentage(currentMonthCountViews, 0);
        downloadsPercentage = calculatePercentage(currentMonthCountViews, 0);
      }
    }
    return {
      commentPercentage: commentPercentage ? commentPercentage.toString() : 0,
      likesPercentage: likesPercentage ? likesPercentage.toString() : 0,
      viewsPercentage: viewsPercentage ? viewsPercentage.toString() : 0,
      sharePercentage: sharePercentage ? sharePercentage.toString() : 0,
      downloadsPercentage: downloadsPercentage
        ? downloadsPercentage.toString()
        : 0,
    };
  },
};
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function calculatePercentage(final, inital) {
  return ((final - inital) / (final + inital)) * 100;
}
