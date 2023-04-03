var axios = require("axios");

var config = {
  method: "post",
  url: "https://fcm.googleapis.com/fcm/send",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "key=AAAAuhoA07Q:APA91bF9RL-xLJN_ENp_ayjEMfvSNujCEZGKd6ipL55_-qlALGzdlZCzOT1opN-Q8DokM6OUbPLHpV5v1ZhbqLqQpjSfJPMvglsCIQHcqOfWpslMAxx7_HSZLRf_dhxTLu61NdZ3Q3t0",
  },
  data: "",
};

module.exports = {
  sendFireBaseNotification: async (mobileToken, bodyText, title, otherData) => {
    //setting up the user information
    var data = JSON.stringify({
      notification: {
        title,
        body: bodyText,
      },
      data: {
        other_data: otherData ? otherData : "",
      },
      to: mobileToken, // device token
    });

    config.data = data;
    return new Promise((resolve, reject) => {
      axios(config)
        .then((response) => {
          if (response) resolve(response);
        })
        .catch((error) => {
          console.log("Error", error);
          reject(error);
        });
    });
  },
};

// async function sendFireBaseNotification(
//   mobileToken,
//   bodyText,
//   title,
//   otherData
// ) {
//   //setting up the user information
//   var data = JSON.stringify({
//     notification: {
//       title,
//       body: bodyText,
//     },
//     data: {
//       other_data: otherData ? otherData : "",
//     },
//     to: mobileToken, // device token
//   });
//
//   config.data = data;
//   return new Promise((resolve, reject) => {
//     axios(config)
//       .then((response) => {
//         console.log(response.data);
//         if (response) resolve(response);
//       })
//       .catch((error) => {
//         console.log("Error", error);
//         reject(error);
//       });
//   });
// }
//
// sendFireBaseNotification(
//   "dwpxdCgZSdCsKuC8uhfrOG:APA91bFenrmM-cFq3CGarZotCZmhTHw7w8DRfwRs6CauLw7Q1msU4WFl_ik7oOCLWyYxiOFzLygCpo_GR-4c3inNfxHWtcTS78bksyJ8Cc5Ko6Dy17Mbowu23mcbt70DZyyw-t8iLb2U",
//   "Testing",
//   "New Message"
// );
