const videoAverageRating = (arr) => {
  if (arr?.reviewPoints?.length > 0 && arr) {
    let total = arr.reviewPoints.reduce(function (acc, obj) {
      return acc + +obj.point;
    }, 0);
    return total / arr.reviewPoints.length;
  } else {
    return 0;
  }
};

const userAverageRating = (obj) => {
  if (obj.rating.length > 0) {
    let total = obj.rating.reduce(function (acc, obj) {
      return acc + +obj.points;
    }, 0);
    return total / obj.rating.length;
  } else {
    return 0;
  }
};

module.exports = { videoAverageRating, userAverageRating };
