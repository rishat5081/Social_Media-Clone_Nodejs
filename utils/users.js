const connectedUsers = [];

module.exports = {
  findUserById: (payload) => {
    return connectedUsers.find((user) => user.id === payload);
  },
  findUserByconversationId: (conversationId) => {
    // console.log("conversationId ===>>>>>", conversationId);
    // console.log("connectedUsers ===>>>>>", connectedUsers);
    const socketList = connectedUsers.filter(
      (user) => user.active_convo_id === conversationId
    );
    return socketList.map((sockets) => sockets.socket_id);
  },
  findUserBySocketId: (socketId) => {
    return connectedUsers.find((user) => user.socket_id == socketId);
  },
  addUser: (obj) => {
    connectedUsers.push(obj);
    return connectedUsers;
  },
  updateUser: (obj, index) => {
    connectedUsers[index] = obj;
  },
  removeUser: (index) => {
    connectedUsers.splice(index, 1);
    // console.log("🚀 ~ file: users.js ~ line 23 ~ removeUser ~ connectedUsers", connectedUsers)
  },
  findIndex: (socketId) => {
    return connectedUsers.findIndex((user) => user.socket_id == socketId);
  },
  findIndexOfUser: (user_id) => {
    return connectedUsers.findIndex((user) => user.id == user_id);
  },
  connectedUsers,
};
