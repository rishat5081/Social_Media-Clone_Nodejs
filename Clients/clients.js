let clientsList = [];

function findClient(clientId) {
  return clientsList.find((clients) => clients.clientId === clientId);
}
function replaceSocketId(clientId, socketId) {
  var indexOfSocketId = clientsList.findIndex((i) => i.clientId === clientId);
  console.log("Replacing the user Socket Id ");
  clientsList[indexOfSocketId] = {
    clientId,
    socketId,
  };
}
module.exports = {
  clientsList,
  findClient,
  addClient: (socketId, clientId) => {
    if (findClient(clientId)) {
      console.log("Client is Already present in the connected clients list");
      replaceSocketId(clientId, socketId);
      return;
    } else {
      clientsList.push({
        socketId,
        clientId,
      });
      // console.log(`All connected users are : ${clientsList}`);
      return;
    }
  },
  removeClient: (socketId) => {
    console.log("Socket Id is removed -----> ", socketId);
    return clientsList.filter((clients) => clients.socketId !== socketId);
  },
};
