const Conversation = require("../../models/Conversation");
const User = require("../../models/User");
const Message = require("../../models/Message");
const { getManyUsersByIds, getUserById } = require("../../services/user");
const { getIO } = require("../../socket");
const { connectedUsers } = require("../../utils/users");

const createConversation = async (req, res, next) => {
  try {
    const { senderId, recieverId } = req.body;

    const isExist = await Conversation.findOne({
      members: { $all: [senderId, recieverId] },
    });

    if (!senderId || !recieverId) {
      return res
        .status(400)
        .json({ success: false, msg: "Required Params Missing!" });
    }
    console.log("isExist ====>>>>>", isExist);

    if (isExist) {
      const reciever = await getUserById(recieverId);

      console.log("reciever ====>>>>>", reciever);

      reciever._doc.conversationId = isExist._id;
      return res.status(200).json({ success: true, conversation: reciever });
    }
    const conversation = new Conversation({
      members: [senderId, recieverId],
    });
    const opponentChatSocketId = connectedUsers.find(
      (user) => user.id == recieverId
    );
    const createdConvo = await conversation.save();
    const sender = await getUserById(senderId);
    const reciever = await getUserById(recieverId);
    // console.log("🚀 ~ file: conversation.js ~ line 40 ~ createConversation ~ reciever", reciever)
    if (opponentChatSocketId) {
      sender._doc.conversationId = createdConvo._id;
      getIO().to(opponentChatSocketId.socket_id).emit("chatCreated", sender);
    }
    reciever._doc.conversationId = createdConvo._id;
    res.status(201).json({ success: true, conversation: reciever });
  } catch (error) {
    console.log("🚀 ~ file: conversation.js ~ line 15 ~ error", error);
    res.status(404).json({ success: false, error });
  }
};

const createGroupConversation = async (req, res, next) => {
  try {
    const { senderId, recieverId, name, avatar } = req.body;
    const conversation = new Conversation({
      name,
      members: [senderId, ...recieverId],
      avatar,
    });
    const recieverSockets = [];
    recieverId.forEach((id) => {
      const find = connectedUsers.find((user) => user.id == id);
      if (find) {
        recieverSockets.push(find.socket_id);
      }
    });

    const createdConvo = await conversation.save();

    recieverSockets.forEach((skt) => {
      getIO().to(skt).emit("grpCreated", createdConvo);
    });

    createdConvo._doc.conversationId = createdConvo?._doc._id;
    res.status(201).json({ success: true, conversation: createdConvo });
  } catch (error) {
    console.log("🚀 ~ file: conversation.js ~ line 15 ~ error", error);
    res.status(500).json({ success: false, error });
  }
};
const getConversations = async (req, res) => {
  try {
    // const { userId } = req.query;
    // const conversations = await Conversation.aggregate([
    //   {
    //     $match: {
    //       members: { $in: [userId] },
    //     },
    //   },
    //   { $project: { _id: 1, members: 1, updatedAt: 1 } },
    //   {
    //     $lookup: {
    //       from: "messages",
    //       let: {
    //         conversation_id: { $toString: "$_id" },
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $eq: ["$conversationId", "$$conversation_id"],
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             isRead: 1,
    //             isDeveler: 1,
    //             isDelete: 1,
    //             conversationId: 1,
    //             sender: 1,
    //             text: 1,
    //             reciever: 1,
    //             createdAt: 1,
    //             updatedAt: 1,

    //             user_id: {
    //               $cond: {
    //                 if: { $eq: ["$sender", userId] },
    //                 then: "$reciever",
    //                 else: "$sender",
    //               },
    //             },
    //           },
    //         },

    // {
    //   $lookup: {
    //     from: "users",
    //     let: {
    //       users_Id: { $toObjectId: "$user_id" },
    //     },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $eq: ["$_id", "$$users_Id"],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: 1,
    //         },
    //       },
    //     ],
    //     as: "userData",
    //   },
    // },
    //       ],
    //       as: "messages",
    //     },
    //   },

    //   {
    //     $sort: { updatedAt: -1 },
    //   },
    // ]);

    const { userId } = req.query;

    const conversations = await Conversation.aggregate([
      {
        $match: {
          members: { $in: [userId] },
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      // {},
    ]);

    let arr = [];

    let conversationsIds = [];
    const groupChatConversations = [];

    if (conversations.length > 0) {
      for (let index of conversations) {
        let friendId = index.members.find((m) => m !== userId);
        if (friendId) {
          arr.push(friendId);
          conversationsIds.push(index._id.toString());
        } else {
          conversationsIds.push(index._id.toString());
        }
      }
    }

    const ress = await Message.aggregate([
      // Matching pipeline, similar to find
      {
        $match: {
          conversationId: { $in: conversationsIds },
        },
      },
      {
        $project: {
          conversationId: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$conversationId",
          text: { $first: "$text" },
          image: { $first: "$image" },
          gif: { $first: "$gif" },
          video: { $first: "$video" },
          pdf: { $first: "$pdf" },
          audio: { $first: "$audio" },
          lastTextTime: { $first: "$createdAt" },
          isRead: { $first: "$isRead" },
          isDeliver: { $first: "$isDeliver" },
          lastMessagesender: { $first: "$sender" },
          conversationId: { $first: "$conversationId" },
        },
      },
    ]);

    const seprateUserConvos = [...conversations];
    seprateUserConvos.forEach((con, index) => {
      if (con?.name) {
        con.conversationId = con?._id;
        groupChatConversations.push(con);
        conversations.splice(index, 1);
      }
    });

    let users = await getManyUsersByIds(arr);
    if (users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        let searchForUserId = users[i]._id;
        for (let j = 0; j < conversations.length; j++) {
          let exist = conversations[j].members.find(
            (member) => member.toString() === searchForUserId.toString()
          );
          let indexOfMessage = ress.findIndex(
            (msg) => msg._id == conversations[j]._id
          );

          //console.log("exist ::", exist);
          if (exist && indexOfMessage > -1) {
            users[i]._doc.conversationId = conversations[j]._id;
            users[i]._doc.lastMessage =
              ress[indexOfMessage]?.text ||
              ress[indexOfMessage]?.pdf ||
              ress[indexOfMessage]?.image ||
              ress[indexOfMessage]?.audio;
            users[i]._doc.video = ress[indexOfMessage]?.video;
            users[i]._doc.lastMessagesender =
              ress[indexOfMessage]?.lastMessagesender;
            users[i]._doc.gif = ress[indexOfMessage]?.gif;
            users[i]._doc.image = ress[indexOfMessage]?.image;
            users[i]._doc.pdf = ress[indexOfMessage]?.pdf;
            users[i]._doc.audio = ress[indexOfMessage]?.audio;
            users[i]._doc.lastTextTime = ress[indexOfMessage]?.lastTextTime;
            users[i]._doc.isRead = ress[indexOfMessage]?.isRead;
            users[i]._doc.isDeliver = ress[indexOfMessage]?.isDeliver;
            users[i]._doc.typing = false;
            // console.log("users[i] :: if  ------------>", users[i]);

            conversationsIds.push(conversations[j]._id.toString());
            break;
          } else if (exist) {
            // console.log("users[i] :: if else  ------------>", users[i]);

            users[i]._doc.conversationId = conversations[j]._id;
            users[i]._doc.typing = false;
            conversationsIds.push(conversations[j]._id.toString());
            break;
          }
        }
      }
    }

    ress.forEach((msg, i) => {
      let index = groupChatConversations.findIndex((grp) => msg._id == grp._id);
      // console.log("🚀 ~ file: conversation.js ~ line 220 ~ ress.forEach ~ index", index)
      if (index > -1) {
        groupChatConversations[index].conversationId = ress[i]?.conversationId;
        groupChatConversations[index].lastMessage =
          ress[i]?.text || ress[i]?.image || ress[i]?.pdf || ress[i]?.audio;
        groupChatConversations[index].video = ress[i]?.video;
        groupChatConversations[index].image = ress[i]?.image;
        groupChatConversations[index].lastMessagesender =
          ress[i]?.lastMessagesender;
        groupChatConversations[index].gif = ress[i]?.gif;
        groupChatConversations[index].pdf = ress[i]?.pdf;
        groupChatConversations[index].audio = ress[i]?.audio;
        groupChatConversations[index].lastTextTime = ress[i]?.lastTextTime;
        groupChatConversations[index].typing = false;
      }
    });
    const finalConvo = [...users, ...groupChatConversations];
    if (conversations.length > 0)
      res.status(200).json({ success: true, conversations: finalConvo });
    else
      res.status(200).json({
        success: true,
        conversations: [],
        message: "No Conversation Found",
      });
  } catch (error) {
    console.log(
      "🚀 ~ file: conversation.js ~ line 36 ~ getConversations: ~ error",
      error
    );
    res.status(500).json({ success: false, error });
  }
};

const getConversationId = async (req, res) => {
  try {
    const { userId } = req.body;
    const loggedInUserId = req.user.id;
    if (!userId) {
      res.status(400).send({ message: "User Id is required" });
      res.end();
      return;
    } else {
      const conversationId = await Conversation.findOne({
        members: { $in: [userId, loggedInUserId] },
      });

      if (conversationId?._id) {
        res.status(200).send({ data: conversationId });
        res.end();
        return;
      } else {
        const newConverstionId = await Conversation.create({
          members: [userId, loggedInUserId],
        });
        if (newConverstionId?._id) {
          res.status(200).send({ data: newConverstionId });
          res.end();
          return;
        }
      }
    }
  } catch (e) {
  } finally {
  }
};
module.exports = {
  getConversations,
  createConversation,
  createGroupConversation,
  getConversationId,
};
