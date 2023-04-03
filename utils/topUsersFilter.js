const _ = require("lodash");

const filterTop = (arr, value) => {
  // console.log("🚀 ~ file: topUsersFilter.js ~ line 5 ~ filterTop ~ arr", arr)

  const fixedArray = _.uniqBy(arr, "userId._id");
  let count;

  for (let i = 0; i < fixedArray.length; i++) {
    count = arr.reduce((acc, ob, index) => {
      if (fixedArray[i]?.userId?._id == arr[index]?.userId?._id) {
        return acc + ob[value];
      }
      return acc;
    }, 0);
    fixedArray[i][value] = count;
  }

  let orderedData = _.orderBy(fixedArray, [value], ["desc", "asc"]).slice(0, 9);

  return orderedData;
};

module.exports = filterTop;
