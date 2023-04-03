const VideoCallingSchema = require("../schemas/VideoCalling");

module.exports = {
  startVideoCall: async (req, res) => {
    try {
      const { callee, conversationId } = req.body;
      const caller = req.user.id;
      if (!(callee, caller)) {
        res.status(400).send({
          message: "Caller and Callee Ids are Required",
        });
        res.end();
        return;
      } else {
        const initiateCall = await VideoCallingSchema.create({
          callee,
          caller,
          conversationId,
        });
        if (initiateCall?._id) {
          res.status(200).send({ message: "Video Call Started" });
          res.end();
          return;
        } else {
          res
            .status(200)
            .send({ message: "Error Inserting the Video Call Details" });
          res.end();
          return;
        }
      }
    } catch (e) {
      res.status(404).send({ message: "Error Starting the Video Call", error });
      res.end();
      return;
    }
  },
  endVideoCall: async (req, res) => {
    try {
      const { callee, conversationId } = req.body;
      const caller = req.user.id;
      if (!(callee, caller)) {
        res.status(400).send({
          message: "Caller and Callee Ids are Required",
        });
        res.end();
        return;
      } else {
        const initiateCall = await VideoCallingSchema.update({
          callee,
          caller,
          conversationId,
        });
        if (initiateCall?._id) {
          res.status(200).send({ message: "Video Call Started" });
          res.end();
          return;
        } else {
          res
            .status(200)
            .send({ message: "Error Inserting the Video Call Details" });
          res.end();
          return;
        }
      }
    } catch (e) {
      res.status(404).send({ message: "Error Starting the Video Call", error });
      res.end();
      return;
    }
  },
};
