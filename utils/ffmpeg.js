const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('@ffprobe-installer/ffprobe');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobe.path);
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);

module.exports = ffmpeg;