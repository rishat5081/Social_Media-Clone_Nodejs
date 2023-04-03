const AWS = require("aws-sdk");
const AWS_S3 = new AWS.S3({
  accessKeyId: "",
  secretAccessKey: "",
});
const ffmpeg = require("../utils/ffmpeg");
const fs = require("fs");
const BUCKET_NAME_STORIES = "vyzmo-stories";
const BUCKET_NAME_STORIES_THUMBNAIL = "vyzmo-stories-thumbnail";

module.exports = {
  uploadStoryToAWS: async (storyPath, storyName) => {
    return new Promise(async (resolve, rejected) => {
      try {
        const fileContent = fs.readFileSync(storyPath);
        console.log("=========== fileContent ;;;;0", fileContent);
        let aws = await AWS_S3.upload({
          Bucket: BUCKET_NAME_STORIES,
          Key: storyName,
          Body: fileContent,
        }).promise();
        console.log("🚀 ~ file: Upload Stories AWS.js ---- ", aws);

        resolve(aws.Location);
      } catch (error) {
        console.error("🚀 ~ file: Upload Stories AWS.js ---- ");
        console.trace(error);
        rejected(null);
      }
    });
  },
  generateThumbnailsOfStory: async (storyPath) => {
    let thumbnailName = "";
    console.log("====== Generating Thumbnail Story ===========", storyPath);
    return new Promise((resolve, reject) => {
      ffmpeg(storyPath)
        .on("filenames", (filenames) => {
          console.log("Will generate " + filenames.join(", "));
          thumbnailName = filenames[0];
        })
        .screenshots({
          // Will take screens at 20%, 40%, 60% and 80% of the video
          count: 1,
          folder: "./thumbnails/",
          size: "320x240",
        })
        .on("end", async () => {
          const fileContent = fs.readFileSync(`thumbnails/${thumbnailName}`);
          console.log("=========== fileContent ;;;;0", fileContent);
          let aws = await AWS_S3.upload({
            Bucket: BUCKET_NAME_STORIES_THUMBNAIL,
            Key: thumbnailName,
            Body: fileContent,
          }).promise();
          console.log("🚀 ~ file: Upload Stories AWS.js ---- ", aws);

          fs.unlinkSync(`thumbnails/${thumbnailName}`);
          resolve(aws.Location);
        });
    });
  },
};
