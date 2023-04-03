const ProfileRating = require("../../models/ProfileRating");
const {
  getProfileRatingById,
  addProfileRating,
  updateProfileRating,
  getUserRating,
} = require("../../services/profileRating");
const { errorName } = require("../error/constants");
module.exports = {
  addProfileRating: async ({ profileRatedTo, profileRatedBy, rating }) => {
    try {
      const profileRating = await getProfileRatingById(
        profileRatedTo,
        profileRatedBy
      );
      if (profileRating) {
        await updateProfileRating(profileRatedTo, profileRatedBy, rating);
        return "Rating Updated";
      } else {
        const ratingStatus = await addProfileRating(
          profileRatedTo,
          profileRatedBy,
          rating
        );

        if (ratingStatus) return "Profile Rating Created";
      }
    } catch (err) {
      console.trace("Error in Adding Profile Rating");
      console.log(err);
      return new Error(errorName.INVALID_CREDENTIALS);
    }
  },

  getUserProfileRating: async ({ userId }) => {
    try {
      if (!userId) return new Error(errorName.BAD_REQUEST);
      else {
        const userRating = await getUserRating(userId);
        if (userRating.length > 0)
          return {
            totalAmount: userRating[0].totalAmount,
            count: userRating[0].count,
          };
        else {
          return {
            totalAmount: 0,
            count: 0,
          };
        }
      }
    } catch (error) {
      return new Error(errorName.SERVER_ERROR);
    }
  },
};
