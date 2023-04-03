const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const { errorName } = require("../error/constants");
const { getIO } = require("../../socket");
const { connectedUsers } = require("../../utils/users");
const AWS = require("aws-sdk");

const {
  sendFireBaseNotification,
} = require("../../services/firebaseNotification");

const { getUserDeviceToken } = require("../../services/user");

const createMessage = async (req, res, next) => {
  try {
    const {
      conversationId,
      senderId,
      text,
      opponentId,
      image,
      video,
      audio,
      pdf,
      isGroup,
      gif,
    } = req.body;

    console.log("req.body : ", req.body);
    const opponent = connectedUsers.find((user) => user.id === opponentId);
    console.log(
      "🚀 ~ file: message.js ~ line 18 ~ createMessage ~ opponent",
      opponent
    );
    // if (!user) {
    //     return new Error(errorName.UN_AUTHORIZED)
    // }
    let bothActive = connectedUsers.filter(
      (user) => user.active_convo_id == conversationId
    );
    // console.log("🚀 ~ file: message.js ~ line 22 ~ createMessage ~ bothActive", bothActive)
    let newMessage;
    if (bothActive.length == 2 && !isGroup) {
      newMessage = new Message({
        conversationId,
        sender: senderId,
        text,
        gif,
        image,
        video,
        audio,
        pdf,
        isRead: true,
        reciever: opponentId,
      });
      console.log(`Inside both active`.red.cyan.bold);
    } else if (opponent) {
      newMessage = new Message({
        conversationId,
        sender: senderId,
        text,
        gif,
        image,
        video,
        audio,
        pdf,
        isDeliver: true,
        reciever: opponentId,
      });

      const userTokens = await getUserDeviceToken({ opponentId });
      console.log(" User Tokens in else if  -----> ", userTokens);

      if (userTokens.androidDeviceToken) {
        await sendFireBaseNotification(
          userTokens.androidDeviceToken,
          text,
          "New Message",
          " "
        );
      } else {
        await sendFireBaseNotification(
          userTokens.iosDeviceToken,
          text,
          "New Message",
          " "
        );
      }

      console.log(`Inside isDeliver`.red.cyan.bold);
    } else {
      newMessage = new Message({
        conversationId,
        sender: senderId,
        text,
        gif,
        image,
        video,
        audio,
        pdf,
        reciever: opponentId,
      });

      const userTokens = await getUserDeviceToken({ opponentId });

      console.log(" User Tokens in else -----> ", userTokens);

      if (userTokens.androidDeviceToken) {
        sendFireBaseNotification(
          userTokens.androidDeviceToken,
          text,
          "New Message",
          " "
        );
      } else {
        sendFireBaseNotification(
          userTokens.iosDeviceToken,
          text,
          "New Message",
          " "
        );
      }

      console.log(`Inside isRead False`.red.cyan.bold);
    }

    let message = await newMessage
      .save()
      .then((msg) =>
        Message.findOne({ _id: msg._id }).populate(
          "sender",
          "username _id avatar"
        )
      )
      .catch((err) => console.log(err));
    const conversation = await Conversation.findOne({ _id: conversationId });

    console.log(
      "conversation conversation conversation conversation :::::",
      conversation
    );
    if (isGroup) {
      conversation.members
        .filter((u) => u !== senderId)
        .forEach((id) => {
          let findedUser = connectedUsers.find((user) => user.id == id);
          console.log(
            "🚀 ~ file: message.js ~ line 33 ~ conversation.members.filter ~ findedUser",
            findedUser
          );
          if (findedUser) {
            getIO().to(findedUser.socket_id).emit("message", { message });
            findedUser = null;
          }
        });
    } else {
      if (opponent) {
        getIO().to(opponent.socket_id).emit("message", { message });
      }
    }

    console.log(
      "conversationIdconversationIdconversationId :::::",
      conversationId
    );
    await Conversation.updateOne(
      {
        _id: conversationId,
      },
      { $set: { updatedAt: new Date() } }
    );
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.log("🚀 ~ file: conversation.js ~ line 15 ~ error", error);
  }
};

const getMessagesByConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.query;

    console.log("req.query ::", req.query);
    await Message.updateMany(
      { isRead: false, conversationId },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ conversationId })
      .sort({ updatedAt: 1 })
      .populate("sender", "username avatar");

    // console.log("messages  :::", messages);
    if (messages.length > 0) {
      let userOnline = connectedUsers.find(
        (user) => user.id === messages[0].reciever.toString()
      );

      if (userOnline)
        getIO().to(userOnline.socket_id).emit("readed", { conversationId });

      res.status(200).json({ success: true, messages: messages });
    } else {
      res.status(200).json({ success: true, messages: [] });
    }
  } catch (error) {
    console.log("🚀 ~ file: conversation.js ~ line 15 ~ error", error);
    res.status(500).json({ success: false, error });
  }
};

module.exports = {
  createMessage,
  getMessagesByConversation,
};
