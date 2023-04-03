let io;

module.exports = {
  init: httpServer => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "*"
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      console.log("IO ERROR ");
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
