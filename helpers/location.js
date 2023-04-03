const axios = require("axios");

const PublicIp = require("nodejs-publicip");

module.exports = {
  findLocation: () => {
    return new Promise(async (resolve, reject) => {
      const data = await new PublicIp().queryPublicIPv4Address();

      axios
        .request({
          method: "GET",
          url: "http://ip-api.com/json/" + data,
        })
        .then(function (response) {
          resolve(response.data.country);
        })
        .catch(function (error) {
          console.error(error);
        });
    });
  },
};
