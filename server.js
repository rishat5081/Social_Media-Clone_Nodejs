const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDB = require("./config/db");
const cors = require("cors");
const graphqlSchema = require("./graphql/schemas/index");
const graphqlResolvers = require("./graphql/resolvers");
const getErrorCode = require("./graphql/error/error");
const conversationRoute = require("./graphql/schemas/conversation");
const TransactionRoute = require("./graphql/schemas/transactionDetail");
const StoryRoute = require("./graphql/schemas/Stories");
const GalleryAPIRoute = require("./graphql/schemas/GalleryAPI");
const VideoCallingAPIRoute = require("./graphql/schemas/VideoCalling");
const PaidVideosRoute = require("./graphql/schemas/PaidVideos");
const PremiumVideosRoute = require("./graphql/schemas/subscription");
const ForgetPasswordRoute = require("./graphql/schemas/ForgetPassword");
const VideosAPIRoute = require("./graphql/schemas/VideosAPI");
const ArticleAPIRoute = require("./graphql/schemas/ArticlesAPI");
const AuthencationAPIRoute = require("./graphql/schemas/AuthencationAPI");
const WalletAPIRoute = require("./graphql/schemas/WalletAPI");
const UserAPIRoute = require("./graphql/schemas/UserAPI");

const messegesRoute = require("./graphql/schemas/message");
const { authenticated } = require("./middleware/auth");
const path = require("path");
const multer = require("multer");
// const videoQualities = require("./helpers/videoConversion");
const {
  convertFourTwentty,
  videoQualities,
  convertThreeSixty,
  convertTwoFourty,
  convertSevenTwenty,
  generateThumbnailsOfVideo,
  convertTenEighty,
} = require("./helpers/videoConversion");
const { s3Uploading, s3UploadingImages } = require("./helpers/s3uploadVideo");
const { findLocation } = require("./helpers/location");
const { createVideo, updateVideo } = require("./services/video");
const fs = require("fs");
const jwtDecode = require("jwt-decode");
var ffprobe = require("ffprobe"),
  ffprobeStatic = require("ffprobe-static");
const {
  addUser,
  connectedUsers,
  findIndexOfUser,
  findIndex,
  removeUser,
  findUserBySocketId,
  findUserById,
  findUserByconversationId,
} = require("./utils/users");
const { updateUser, getUserById } = require("./services/user");
const { getAllUserFollowers } = require("./services/follower");
const Notification = require("./models/Notification");
const { getIO } = require("./socket");
const notificaion = require("./helpers/notification");
const axios = require("axios");
const web3 = require("web3");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const User = require("./models/User");
var morgan = require("morgan");
const objectId = require("mongodb").ObjectId;

const { isObjectType } = require("graphql");
var {
  addClient,
  findClient,
  clientsList,
  removeClient,
} = require("./Clients/clients");
const app = express();
app.use(cors({ origin: true }));
dotenv.config({ path: "./config/config.env" });
connectDB();

app.use(express.json({ limit: "1000000000mb" }));
app.use(authenticated);

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use("*", (req, res, next) => {
  console.log("The IP address is :", req.connection.remoteAddress);
  next();
});
const storage = multer.diskStorage({
  destination: "./videos/",
  limits: { fileSize: 1000000000 },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const storage1 = multer.diskStorage({
  destination: "./media/",
  limits: { fileSize: 1000000000 },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//  const multerFile_Upload_Function = multer({
//   storage: multerStorage,
//   limits: {    fileSize: 1000000000,  },
//     fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//    },
//   }).any();

const upload = multer({
  storage: storage,
});

const upload1 = multer({
  storage: storage1,
});

app.use("/api/v1/convo", conversationRoute);
app.use("/api/v1/message", messegesRoute);
app.use("/api/v1/transaction", TransactionRoute);
app.use("/api/v1/stories", StoryRoute);
app.use("/api/v1/gallery", GalleryAPIRoute);
app.use("/api/v1/videoCalling", VideoCallingAPIRoute);
app.use("/api/v1/paidVideos", PaidVideosRoute);
app.use("/api/v1/premiumVideo", PremiumVideosRoute);
app.use("/api/v1/forgetPassword", ForgetPasswordRoute);
app.use("/api/v1/video", VideosAPIRoute);
app.use("/api/v1/authentication", AuthencationAPIRoute);
app.use("/api/v1/wallet", WalletAPIRoute);
app.use("/api/v1/article", ArticleAPIRoute);
app.use("/api/v1/user", UserAPIRoute);

app.post("/media", upload1.single("media"), async (req, res, next) => {
  console.log(
    "============================ Media ============================="
  );
  try {
    if (!req?.file?.filename) {
      return res.status(400).json({ success: false, msg: "File is missing" });
    }
    const s3ImageUrl = await s3UploadingImages(
      `${__dirname}/media/${req.file.filename}`,
      req.file.filename,
      null,
      null,
      null,
      "vyzmoer-messenger"
    );
    // console.log("🚀 ~ file: server.js ~ line 71 ~ app.post ~ s3ImageUrl", s3ImageUrl)
    fs.unlinkSync(`media/${req.file.filename}`);
    return res.status(201).json({ success: true, url: s3ImageUrl });
  } catch (error) {
    console.log("🚀 ~ file: server.js ~ line 74 ~ app.post ~ error", error);
    return res.status(400).json({ success: false });
  }
});

//device token update
app.post("/updateDeviceToken", async (req, res) => {
  let { userId, iosDeviceToken, androidDeviceToken } = req.body;
  if (!userId) {
    console.log("User Id is mandatory ----->");
    res.send({ error: new Error(), message: "user Id is mandatory" });
    res.end();
    return;
  } else {
    let updateObject = {};
    if (iosDeviceToken) {
      updateObject["iosDeviceToken"] = iosDeviceToken;
    }
    if (androidDeviceToken) {
      updateObject["androidDeviceToken"] = androidDeviceToken;
    }
    if (updateObject) {
      const userUpdateStatus = await User.updateOne(
        {
          _id: userId,
        },
        {
          $set: updateObject,
        }
      );

      console.log("User Update Status", userUpdateStatus);
      if (userUpdateStatus) {
        res.status(200).send({ message: "Updated" });
        res.end();
        return;
      } else {
        res.status(500).send({ message: "Error Updating the Access Token" });
        res.end();
        return;
      }
    }
  }
});

const validateToken = async (req, res, next) => {
  if (req.headers.authorization) {
    console.log(
      "===================== Req Header ======================",
      req.headers
    );
    const bearerHeader = req.headers.authorization.split(" ");
    const jwtToken = bearerHeader[1];

    console.log(
      "===================== jwtToken ======================",
      jwtToken
    );

    if (jwtToken) {
      const verificationResponse = await jwtDecode(bearerHeader[1]);
      if (verificationResponse) {
        req.user = { id: verificationResponse.user.id };
        next();
      }
    } else {
      res
        .status(400)
        .send({ status: "Invalid", message: "Invalid Token,Try Again" });
      res.end();
    }
  } else {
    res.status(400).send({ status: "Fail", message: "Token is Required" });
    res.end();
  }
};

app.post(
  "/upload",
  upload.single("video"),
  validateToken,
  async (req, res, next) => {
    console.log("------ Req Query --------", req.query);
    console.log("------ Req Body --------", req.body);
    console.log("===== Video Upload ==========");

    const videoInfo = await ffprobe(
      `${__dirname}/videos/${req.file.filename}`,
      {
        path: ffprobeStatic.path,
      }
    );
    const quality = videoInfo.streams[0].width;

    let result = await s3Uploading(
      `${__dirname}/videos/${req.file.filename}`,
      req.file.filename,
      req.user.id,
      quality,
      "mainVideo"
    );

    req.query.originalVideo = result.originalVideo;
    req.query.userId = result.userId;
    const geoLocation = await findLocation();
    req.query.location = geoLocation;

    let doc = await createVideo(req.query);
    // console.log("🚀 ~ file: server.js ~ line 61 ~ app.post ~ doc", doc)

    const videoCreatedUser = await getUserById(req.user.id);

    let obj = {
      actionTitle: req.query.videoTitle,
      user_id: req.user.id,
      time: Date.now(),
      video_id: doc._id,
      avatar: videoCreatedUser.avatar,
      username: videoCreatedUser.username,
    };

    if (result?.originalVideo) {
      console.log(
        "=======================================  Uploaded to AWS ======================================="
      );
      res.status(200).json({ success: true });
    }

    await notificaion(obj, req.user.id);

    videoQualities(
      `${__dirname}/videos/${req.file.filename}`,
      req.file.originalname,
      req.user.id,
      doc._id
    );
    if (!req.query.thumbnail) {
      console.log("Generate Thummbnail");
      await generateThumbnailsOfVideo();
    } else {
      console.log("Thumbnail Link");
      await updateVideo(doc._id, { thumbnail: req.query.thumbnail });
    }

    if (quality === 2560) {
      await convertTenEighty();
      await convertSevenTwenty();
      await convertFourTwentty();
      await convertThreeSixty();
      await convertTwoFourty();
    }

    if (quality === 1920) {
      await convertSevenTwenty();
      await convertFourTwentty();
      await convertThreeSixty();
      await convertTwoFourty();
    }

    if (quality === 1280) {
      await convertFourTwentty();
      await convertThreeSixty();
      await convertTwoFourty();
    }

    if (quality === 854) {
      await convertThreeSixty();
      await convertTwoFourty();
    }

    if (quality <= 640) {
      await convertTwoFourty();
    }

    await fs.unlinkSync(`videos/${req.file.filename}`);
    console.log("SUCCESS UPLOAD CONVRERT DATABSE GENERARTED");
  }
);

app.use(
  "/vyzmo",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    pretty: true,
    // customFormatErrorFn: (err) => {
    //   const error = getErrorCode(err.message);
    //   return ({ message: error?.message, statusCode: error?.statusCode })
    // }
  })
);

//port for listening of the node server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  );
});
//setting up the socket server here

const io = require("./socket").init(server);

//function for sending the deliver messages
const executeDeliverMessage = async (id, socket) => {
  // console.log('executeDeliverMessage ##############',id)

  let allConversationsByUser = await Conversation.find({
    members: { $in: [id] },
  });
  let opponentUserIds = [];

  // console.log(" &&&&&&&&&&&&&&&&&&&&&&&&&&&&& allConversationsByUser : ", allConversationsByUser);
  allConversationsByUser.forEach((conv, index, object) => {
    if (conv.members.length == 2 && !conv?.name) {
      opponentUserIds.push(conv.members.filter((user) => user !== id)[0]);
    }
  });
  await Message.updateMany(
    {
      $and: [{ reciever: id }, { isDeliver: false }],
    },
    { $set: { isDeliver: true } }
  );

  // console.log("opponentUserIds ----- > : ", opponentUserIds);
  // console.log("connectedUsers ----- > : ", connectedUsers);

  opponentUserIds.forEach((id, index) => {
    // console.log("asssssssssssssssssssssssssssssssssssssssssss", id);
    let user = connectedUsers.find((userd) => userd.id == id);
    // console.log("user   ::: ", user);
    // console.log(' user.socket_id ########################## ---------------', user.socket_id)
    if (user) {
      socket
        .to(user.socket_id)
        .emit("delivered", { conversationId: user.active_convo_id });
    }
  });
  // console.log(`Socket for Delivered End`.red.underline.bold)
};

//here the sockets are handled here
//if the user is connected to the server through the server

/* OLD Code ***/
io.on("connection", (socket) => {
  // console.log("Client connected through socket : ", socket);
  io.emit("userConnected", { msg: "Connected" });

  socket.on("info", async (data) => {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    if (data?.userId == "null") {
      return;
    }
    let id = data._id;
    let socketId = socket.id;
    let userSocketIdExist = findUserBySocketId(socketId);
    let userIdExist = findUserById(id);
    if (!userSocketIdExist && !userIdExist) {
      addUser({ id, socket_id: socketId, active_convo_id: null });
      await updateUser(id, { online: true });

      executeDeliverMessage(id, socket);
      socket.broadcast.emit("online", { id });
    }
    //console.log("All Users Connected =====================>", connectedUsers);
  });

  socket.on("onType", (data) => {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    const rec = findUserById(data.reciever);

    if (rec) {
      socket.to(rec.socket_id).emit("typing", {
        sender: data.sender,
        isTyping: data?.isTyping,
        username: data?.username,
        conversationId: data?.conversationId,
      });
    }
  });

  // for group
  socket.on("onTypeGroup", async (data) => {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    const UserByconversationRec = await findUserByconversationId(
      data.conversationId
    );
    console.log("Found -------------- ===>>>>>", UserByconversationRec);
    if (UserByconversationRec) {
      socket.to(UserByconversationRec).emit("typingGroup", {
        sender: data.sender,
        isTyping: data?.isTyping,
        username: data?.username,
        conversationId: data?.conversationId,
      });
    }
  });

  //end
  socket.on("inChat", (data) => {
    console.log("🚀 ~ file: server.js ~ line 280 ~ socket.on ~ data", data);
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    let index = findIndexOfUser(data.user_id);
    if (index > -1) {
      connectedUsers[index].active_convo_id = data.convo_id;
    }
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    console.log(
      `================> call event trigger`.red.cyan.bold,
      userToCall,
      signalData,
      from,
      name
    );
    let index = findIndexOfUser(userToCall);
    console.log("🚀 ~ file: server.js ~ line 290 ~ socket.on ~ index", index);
    if (index == -1) {
      return;
    }
    socket
      .to(connectedUsers[index].socket_id)
      .emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    console.log("🚀 ~ file: server.js ~ line 288 ~ socket.on ~ data", data);
    let userId = "61c78ef36d961c48f31e444c";
    console.log(`================> Opponent Recieved the call`.blue.cyan.bold);
    let index = findIndexOfUser(userId);
    console.log("🚀 ~ file: server.js ~ line 292 ~ socket.on ~ index", index);

    if (index == -1) {
      return;
    }
    socket
      .to(connectedUsers[index].socket_id)
      .emit("callAccepted", data.signal);
  });

  socket.on("deleteMessage", async (data) => {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    if (data?.msgId == "null") {
      return;
    }
    const getObject = () => {
      if (data?.text) {
        return {
          text: null,
          isDelete: true,
        };
      }

      if (data?.pdf) {
        return {
          pdf: null,
          isDelete: true,
        };
      }

      if (data?.gif) {
        return {
          gif: null,
          isDelete: true,
        };
      }

      if (data?.audio) {
        return {
          audio: null,
          isDelete: true,
        };
      }

      if (data?.video) {
        return {
          video: null,
          isDelete: true,
        };
      }

      if (data?.image) {
        return {
          image: null,
          isDelete: true,
        };
      }
    };

    await Message.findOneAndUpdate(
      { _id: data?.msgId },
      { $set: getObject() },
      { new: true }
    );
    let isuserOnline = findIndexOfUser(data?.opponentId);
    let senderIndex = findIndexOfUser(data?.senderId);

    console.log("isuserOnline  : : : ", isuserOnline);
    console.log("senderIndex  : : : ", senderIndex);
    if (
      isuserOnline > -1 &&
      connectedUsers[isuserOnline].active_convo_id ==
        connectedUsers[senderIndex].active_convo_id
    ) {
      socket.to(connectedUsers[isuserOnline].socket_id).emit("messageDeleted", {
        success: true,
        msgId: data?.msgId,
        text: data?.text,
        pdf: data?.pdf,
        gif: data?.pdf,
        audio: data?.audio,
        video: data?.video,
        image: data?.image,
      });
    }
    let me = findIndexOfUser(data?.senderId);
    io.to(connectedUsers[me].socket_id).emit("deleteMessage", {
      success: true,
      msgId: data?.msgId,
      text: data?.text,
      pdf: data?.pdf,
      gif: data?.pdf,
      audio: data?.audio,
      video: data?.video,
      image: data?.image,
    });
  });

  /**
   * Delete Group Message
   */
  socket.on("deleteGroupMessage", async (data) => {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    if (data?.msgId == "null") {
      return;
    }
    const getObject = () => {
      if (data?.text) {
        return {
          text: null,
          isDelete: true,
        };
      }

      if (data?.pdf) {
        return {
          pdf: null,
          isDelete: true,
        };
      }

      if (data?.gif) {
        return {
          gif: null,
          isDelete: true,
        };
      }

      if (data?.audio) {
        return {
          audio: null,
          isDelete: true,
        };
      }

      if (data?.video) {
        return {
          video: null,
          isDelete: true,
        };
      }

      if (data?.image) {
        return {
          image: null,
          isDelete: true,
        };
      }
    };

    await Message.findOneAndUpdate(
      { _id: data?.msgId },
      { $set: getObject() },
      { new: true }
    );
    let groupUserSocketIds = findUserByconversationId(data?.active_convo_id);

    io.to(groupUserSocketIds).emit("deleteGroupMessage", {
      success: true,
      msgId: data?.msgId,
      text: data?.text,
      pdf: data?.pdf,
      gif: data?.pdf,
      audio: data?.audio,
      video: data?.video,
      image: data?.image,
    });
  });

  socket.on("updateMessage", async (data) => {
    console.log("-------------------------------------------------------");
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    if (data?.msgId == "null") {
      return;
    }

    const getObject = () => {
      if (data?.text) {
        return {
          text: data?.text,
          isUpdate: true,
        };
      }

      if (data?.pdf) {
        return {
          pdf: data?.pdf,
          isUpdate: true,
        };
      }

      if (data?.gif) {
        return {
          gif: data?.gif,
          isUpdate: true,
        };
      }

      if (data?.audio) {
        return {
          audio: data?.audio,
          isUpdate: true,
        };
      }

      if (data?.video) {
        return {
          video: data?.video,
          isUpdate: true,
        };
      }

      if (data?.image) {
        return {
          image: data?.image,
          isUpdate: true,
        };
      }
    };

    let msg = await Message.findOneAndUpdate(
      { _id: data?.msgId },
      { $set: getObject() },
      { new: true }
    );
    let isuserOnline = findIndexOfUser(data?.opponentId);
    let senderIndex = findIndexOfUser(data?.senderId);
    if (
      isuserOnline > -1 &&
      connectedUsers[isuserOnline].active_convo_id ==
        connectedUsers[senderIndex].active_convo_id
    ) {
      socket
        .to(connectedUsers[isuserOnline].socket_id)
        .emit("messageUpdated", { success: true, msg });
    }
    let me = findIndexOfUser(data?.senderId);
    io.to(connectedUsers[me].socket_id).emit("updateMessage", {
      success: true,
      msg,
    });
  });

  /**

  Video Calling sockets

  */

  socket.on("disconnect", async function () {
    let index = findIndex(socket.id);
    if (index == -1) {
      return;
    }

    let user = await updateUser(connectedUsers[index].id, { online: false });

    if (user === null) {
      console.log("user          ---->", user);
    } else {
      socket.broadcast.emit("offline", {
        id: connectedUsers[index]?.id,
        lastSeen: user.updatedAt,
      });
      removeUser(index);
    }
  });
});

/**** Old Code ***/

/**


**
*
NEW CODE  for the Video Calling
*
*/
//
io.on("connection", (socket) => {
  console.log(`The user is connected with a socket : ${socket.id}`);

  //adding the client to the connected list
  socket.on("addClient", (clientDaata) => {
    console.log(" ---- clientDaata.clientId ----", clientDaata.clientId);
    addClient(socket.id, clientDaata.clientId);
    // clientsList.forEach((client) => {
    //   console.log("Clients List  :::: ", client);
    // });
  });

  //getting the user offer here

  socket.on("video-calling-user", (data) => {
    console.log(
      "----------------- video-calling-user -----------------",
      data.userToCall
    );
    const userSocketInfo = findClient(data.userToCall);
    io.to(userSocketInfo?.socketId).emit("video-calling-user", {
      from: data.from,
      name: data.name,
      signal: data.signalData,
    });
    // socket.emit("signal", data.signalData);
  });

  socket.on("video-answering-call", (data) => {
    console.log("----------------- video-answering-call -----------------");

    if (data?.signal?.type === "answer") {
      const userSocketInfo = findClient(data.from);
      // socket.to(userSocketInfo?.socketId).emit("signal", data.signalData);
      io.to(userSocketInfo?.socketId).emit("callAccepted", {
        signal: data.signal,
      });
    }

    //socket.emit("callAccepted", { signal: data.signal });
  });
  socket.on("video-stop", (data) => {
    console.log("----------------- video-stop -----------------", data);

    if (data?.userToCall) {
      const userSocketInfo = findClient(data.userToCall);
      // socket.to(userSocketInfo?.socketId).emit("video-stop", data.signalData);
      io.to(userSocketInfo?.socketId).emit("video-stop", {
        userToCall: data.userToCall,
      });
    }

    //socket.emit("callAccepted", { signal: data.signal });
  });
  // socket.on("stop-video-stop-user", (data) => {
  //   console.log("----------------- video-stop-user -----------------", data);
  //
  //   if (data?.userToCall) {
  //     const userSocketInfo = findClient(data.userToCall);
  //     // socket.to(userSocketInfo?.socketId).emit("video-stop", data.signalData);
  //     io.to(userSocketInfo?.socketId).emit("video-stop", {
  //       userToCall: data.userToCall,
  //     });
  //   }
  //
  //   //socket.emit("callAccepted", { signal: data.signal });
  // });

  socket.on("endCall", (data) => {
    console.log("=========== Ending Call ========");
    if (data?.userToCall) {
      const userSocketInfo = findClient(data.userToCall);
      socket.to(userSocketInfo?.socketId).emit("endCall", {
        status: true,
      });
      io.to(userSocketInfo?.socketId).emit("endCall", {
        status: true,
      });
    }

    //socket.emit("callAccepted", { signal: data.signal });
  });

  socket.on("startVideo", (data) => {
    console.log("=========== Start Video Call ========", data);
    if (data?.userToCall) {
      const userSocketInfo = findClient(data.userToCall);
      socket.to(userSocketInfo?.socketId).emit("startVideo", {
        userToCall: data.userToCall,
      });

      io.to(userSocketInfo?.socketId).emit("startVideo", {
        userToCall: data.userToCall,
      });
    }
  });

  socket.on("mic-stop", (data) => {
    console.log("=========== Stop Mic Video Call ========", data);
    if (data?.userToCall) {
      const userSocketInfo = findClient(data.userToCall);
      socket.to(userSocketInfo?.socketId).emit("mic-stop", {
        userToCall: data.userToCall,
      });

      io.to(userSocketInfo?.socketId).emit("mic-stop", {
        userToCall: data.userToCall,
      });
    }
  });

  socket.on("startMic", (data) => {
    console.log("=========== Start Mic Video Call ========", data);
    if (data?.userToCall) {
      const userSocketInfo = findClient(data.userToCall);
      socket.to(userSocketInfo?.socketId).emit("startMic", {
        userToCall: data.userToCall,
      });

      io.to(userSocketInfo?.socketId).emit("startMic", {
        userToCall: data.userToCall,
      });
    }
  });

  // socket.on("sendIceCandidate", (iceCandidate) => {
  //   console.log("Printing the Ice Candidate  --- > ", iceCandidate);
  // });
  //handling the message which are sending from the client side
  /***
   *
   *
   * Here is the socket which will be used to create or join the room
   * for one - one video and audio calling the user will emit this event and it will be checked that the user
   * already have the room or not
   * if the room exists than it will be checked how many sockets are present in that room

   *
   */
  socket.on("message", (data) => {
    console.log("Client said: ", data.message);

    clientsList.forEach((client) => {
      console.log("Clients List  :::: ", client);
    });
    var clientSocketId = findClient(data.clientId);
    console.log("clientSocketId ::::::: ", clientSocketId);
    // for a real app, would be room-only (not broadcast)
    socket.to(clientSocketId.socketId).emit("message", data.message);
  });

  //disconnecting the client from server
  socket.on("disconnect", () => {
    console.log(`Client is disconnected of socket ${socket.id}`);
    removeClient(socket.id);
  });
});

/**

*
*
*
NEW CODE
*
**
*
*/
//
// const Video = require("./models/Video");
// const country = ["Pakistan", "Sri Lanka", "Bangladesh"];
//

// var randomstring = require("randomstring");

// const fingerprint = randomstring.generate({
//   length: 36,
//   charset: "alphanumeric",
//   capitalization: "uppercase",
// });
//
// console.log("aa------------", fingerprint);
//
// (async () => {
//   const response = await Video.updateMany({}, { profileViews: [] });
//
//   console.log("-------", response);
//   // console.log("---response ,,,,", response.length);
//   //
//   // for (var i = 0; i < response.length; i++) {
//   //   const location = Math.floor(ndom() * 3000) + 3000;
//   //   console.log("Updating", i, "-----", location);
//   //
//   //   for (var j = 0; j < location; j++) {
//   //     console.log("--------- location --------------", location);
//   //     console.log("--------- Current --------------", j);
//   //     const fingerprint = randomstring.generate({
//   //       length: 36,
//   //       charset: "alphanumeric",
//   //       capitalization: "uppercase",
//   //     });
//   //
//   //     await Video.updateOne(
//   //       { _id: response[i]._id },
//   //       {
//   //         $push: {
//   //           profileViews: { _id: new objectId(), fingerprint: fingerprint },
//   //         },
//   //       },
//   //       function (err, result) {
//   //         if (err) {
//   //           console.log("---response ,,,,", err);
//   //         } else {
//   //           console.log("---response ,,,,");
//   //         }
//   //       }
//   //     );
//   //   }
//   // }
// })();

// const userIds = [
//   "620bae48710f5b3a65acc897",
//   "620bae49710f5b3a65acc898",
//   "620bae49710f5b3a65acc899",
//   "620bae4b710f5b3a65acc89a",
//   "620bae4b710f5b3a65acc89b",
//   "620bae4b710f5b3a65acc89c",
//   "620bae4b710f5b3a65acc89d",
//   "620bae4c710f5b3a65acc89e",
//   "620bae4c710f5b3a65acc89f",
//   "620bae4c710f5b3a65acc8a0",
//   "620bae4c710f5b3a65acc8a1",
//   "620bae4c710f5b3a65acc8a2",
//   "620bae4d710f5b3a65acc8a3",
//   "620bae4d710f5b3a65acc8a4",
//   "620bae4d710f5b3a65acc8a5",
//   "620bae4d710f5b3a65acc8a6",
//   "620bae4e710f5b3a65acc8a7",
//   "620bae4e710f5b3a65acc8a8",
//   "620bae4e710f5b3a65acc8a9",
//   "620bae4e710f5b3a65acc8aa",
//   "620bae4e710f5b3a65acc8ab",
//   "620bae4f710f5b3a65acc8ac",
//   "620bae4f710f5b3a65acc8ad",
//   "620bae4f710f5b3a65acc8ae",
//   "620bae4f710f5b3a65acc8af",
//   "620bae50710f5b3a65acc8b0",
//   "620bae50710f5b3a65acc8b1",
//   "620bae50710f5b3a65acc8b2",
//   "620bae50710f5b3a65acc8b3",
//   "620bae50710f5b3a65acc8b4",
//   "620bae51710f5b3a65acc8b5",
//   "620bae51710f5b3a65acc8b6",
//   "620bae51710f5b3a65acc8b7",
//   "620bae51710f5b3a65acc8b8",
//   "620bae52710f5b3a65acc8b9",
//   "620bae52710f5b3a65acc8ba",
//   "620bae52710f5b3a65acc8bb",
//   "620bae52710f5b3a65acc8bc",
//   "620bae52710f5b3a65acc8bd",
//   "620bae53710f5b3a65acc8be",
//   "620bae53710f5b3a65acc8bf",
//   "620bae53710f5b3a65acc8c0",
//   "620bae53710f5b3a65acc8c1",
//   "620bae54710f5b3a65acc8c2",
//   "620bae54710f5b3a65acc8c3",
//   "620bae54710f5b3a65acc8c4",
//   "620bae54710f5b3a65acc8c5",
//   "620bae54710f5b3a65acc8c6",
//   "620bae55710f5b3a65acc8c7",
//   "620bae55710f5b3a65acc8c8",
// ];
//
// const Follower = require("./models/Follower");
// const { faker } = require("@faker-js/faker");
//
// // for (var i = 0; i < 150; i++) {
// //   console.log(faker.name.findName());
// // }

const country = ["Pakistan", "Sri Lanka", "Bangladesh"];

// (async () => {
//   const userss = await User.find();
//
//   // if (userss.length > 0) {
//   for (var variable of userIds) {
//     // for (var i = 0; i < 80; i++) {
//     await User.updateOne(
//       { _id: new objectId(variable._id) },
//       {
//         $set: {location: country[Math.floor(ndom() * 3000) + 3000] }
//       },
//       function (err, result) {
//         if (err) {
//           console.log(variable, "---response ,,,,", err);
//         } else {
//           console.log(variable, "variable---response ,,,,");
//         }
//       }
//     );
//     }
//   }
//   // }
// })();

// for (var i = 0; i < 20; i++) {
//   console.log(Math.floor(Math.random() * 3));
// }
