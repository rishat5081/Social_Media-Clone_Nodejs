const ffmpeg = require("../utils/ffmpeg");
const fs = require("fs");
const {
  addfourEightyVideo,
  addthreeSixtyVideo,
  addtwoFourtyVideo,
  addSevenTwentyVideo,
  addtenEightyVideo,
  updateVideo,
} = require("../services/video");
const { s3Uploading, s3UploadingThumbnails } = require("./s3uploadVideo");

let videoDir;
let fileOriginalName;
let nameAfterRemoveMp4;
let document_id;
let thumbnailName;

const videoQualities = (videoPath, name, user_id, doc_id) => {
  const videoName = videoPath.split("/videos/")[1];
  const removeMp4 = videoName.split(".")[0];

  nameAfterRemoveMp4 = removeMp4;
  videoDir = videoPath;
  document_id = doc_id;
};

const generateThumbnailsOfVideo = () => {
  console.log(
    "============ convertTenEighty  videoDir   ===============",
    videoDir
  );
  return new Promise((resolve, reject) => {
    ffmpeg(videoDir)
      .on("end", async () => {
        let url = await s3UploadingThumbnails(
          `thumbnails/${thumbnailName}`,
          thumbnailName,
          null,
          "thumbnail"
        );
        await updateVideo(document_id, { thumbnail: url });
        fs.unlinkSync(`thumbnails/${thumbnailName}`);
        resolve();
      })
      .on("filenames", (filenames) => {
        console.log("Will generate " + filenames.join(", "));
        thumbnailName = filenames[0];
      })
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        count: 1,
        folder: "./thumbnails/",
        size: "320x240",
      });
  });
};

const convertFourTwentty = () => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoDir)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size("854x480")
      .on("error", (err) => {
        console.log("An error occurred: ");
        console.trace(err.message);
        reject();
      })
      .on("end", async () => {
        console.log("480p CONVERSIONN SUCCESSFULL!");
        let result = await s3Uploading(
          `convertedVideos/${nameAfterRemoveMp4}-480.mp4`,
          `${nameAfterRemoveMp4}-480.mp4`,
          null,
          "480"
        );
        // console.log(doc_id, result.originalVideo)
        let updatee = await addfourEightyVideo(
          document_id,
          result.originalVideo
        );
        fs.unlinkSync(`convertedVideos/${nameAfterRemoveMp4}-480.mp4`);
        resolve();
      })
      .save(`convertedVideos/${nameAfterRemoveMp4}-480.mp4`);
  });
};

const convertThreeSixty = () => {
  console.log(
    "============ convertThreeSixty  videoDir   ===============",
    videoDir
  );
  return new Promise((resolve, reject) => {
    ffmpeg(videoDir)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size("640x360")
      .on("error", (err) => {
        console.log("An error occurred: ");
        console.trace(err.message);
        reject();
      })
      .on("end", async () => {
        console.log("360p CONVERSIONN SUCCESSFULL!");
        let result = await s3Uploading(
          `convertedVideos/${nameAfterRemoveMp4}-360.mp4`,
          `${nameAfterRemoveMp4}-360.mp4`,
          null,
          "360"
        );

        let three = await addthreeSixtyVideo(document_id, result.originalVideo);
        fs.unlinkSync(`convertedVideos/${nameAfterRemoveMp4}-360.mp4`);
        resolve();
      })
      .save(`convertedVideos/${nameAfterRemoveMp4}-360.mp4`);
  });
};

const convertTwoFourty = () => {
  console.log("===== convertTwoFourty  videoDir   =====", videoDir);
  return new Promise((resolve, reject) => {
    ffmpeg(videoDir)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size("426x240")
      .on("error", (err) => {
        console.log("An error occurred: ");
        console.trace(err.message);
        reject();
      })
      .on("end", async () => {
        console.log("240p CONVERSIONN SUCCESSFULL!");
        let result = await s3Uploading(
          `convertedVideos/${nameAfterRemoveMp4}-240.mp4`,
          `${nameAfterRemoveMp4}-240.mp4`,
          null,
          "240"
        );
        console.log("result ----", result);

        console.log(
          "document_id, result.originalVideo",
          document_id,
          result.originalVideo
        );
        await addtwoFourtyVideo(document_id, result.originalVideo);
        fs.unlinkSync(`convertedVideos/${nameAfterRemoveMp4}-240.mp4`);
        resolve();
      })
      .save(`convertedVideos/${nameAfterRemoveMp4}-240.mp4`);
  });
};

const convertSevenTwenty = () => {
  console.log(
    "============ convertSevenTwenty  videoDir   ===============",
    videoDir
  );
  return new Promise((resolve, reject) => {
    ffmpeg(videoDir)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size("1280x720")
      .on("error", (err) => {
        console.log("An error occurred: ");
        console.trace(err.message);
        reject();
      })
      .on("end", async () => {
        console.log("720p CONVERSIONN SUCCESSFULL!");
        let result = await s3Uploading(
          `convertedVideos/${nameAfterRemoveMp4}-720.mp4`,
          `${nameAfterRemoveMp4}-720.mp4`,
          null,
          "720"
        );
        await addSevenTwentyVideo(document_id, result.originalVideo);
        fs.unlinkSync(`convertedVideos/${nameAfterRemoveMp4}-720.mp4`);

        resolve();
      })
      .save(`convertedVideos/${nameAfterRemoveMp4}-720.mp4`);
  });
};

const convertTenEighty = () => {
  console.log(
    "============ convertTenEighty  videoDir   ===============",
    videoDir
  );
  return new Promise((resolve, reject) => {
    ffmpeg(videoDir)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size("1920x1080")
      .on("error", (err) => {
        console.log("An error occurred: ");
        console.trace(err.message);
        reject();
      })
      .on("end", async () => {
        console.log("1080p CONVERSIONN SUCCESSFULL!");
        let result = await s3Uploading(
          `convertedVideos/${nameAfterRemoveMp4}-1080.mp4`,
          `${nameAfterRemoveMp4}-1080.mp4`,
          null,
          "1080"
        );
        await addtenEightyVideo(document_id, result.originalVideo);
        fs.unlinkSync(`convertedVideos/${nameAfterRemoveMp4}-1080.mp4`);

        resolve();
      })
      .save(`convertedVideos/${nameAfterRemoveMp4}-1080.mp4`);
  });
};

/***



*
*
*   New Code for the videos which are not
**
*
*
*

*/

module.exports = {
  generateThumbnailsOfVideo,
  videoQualities,
  convertFourTwentty,
  convertThreeSixty,
  convertTwoFourty,
  convertSevenTwenty,
  convertTenEighty,
};
