const Message = require("../models/Message");
const Conversation = require("../models/Conversations");
const Team = require("../models/Team");
const generateRandom10DigitNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000); // Generates a random number between 1000000000 and 9999999999
};

// Example usage:
exports.fetchallmsgs = async (req, res) => {
  try {
    const { id } = req.body;
    const msg = await Message.find({ orgid: id })
      .populate("sender", "name")
      .sort({ createdtAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, msg });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.postmsg = async (req, res) => {
  try {
    const { convId, senderId, receiverId, text } = req.body;
    //const messag=await Message.find()
    const mesId = generateRandom10DigitNumber();

    const messag = new Message({
      conversationId: convId,
      sender: senderId,
      receiver: receiverId,
      text: text,
      mesId: mesId,
    });
    await messag.save();
    await Conversation.findOneAndUpdate(
      { members: { $all: [senderId, receiverId] } },
      { $push: { message: messag._id } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Message saved" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, message: "Message not saved" });
  }
};

exports.getmsg = async (req, res) => {
  try {
    const { convId } = req.params;
    const data = await Message.find({ conversationId: convId });
    res.status(200).json({ success: true, data: data });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, message: "Message not saved" });
  }
};

exports.sendteammsg = async (req, res) => {
  try {
    const { teamId, myid, text } = req.body;
    const mesId = generateRandom10DigitNumber();

    //const messag=await Message.find()
    const messag = new Message({
      teamconvId: teamId,
      sender: myid,
      text: text,
      mesId: mesId,
    });
    await messag.save();
    await Team.findOneAndUpdate(
      { _id: teamId },
      { $push: { messages: messag._id } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Team Message saved" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, message: "Team Message not saved" });
  }
};

exports.getTeammsg = async (req, res) => {
  try {
    const { teamId } = req.params;
    const data = await Message.find({ teamconvId: teamId });
    res.status(200).json({ success: true, data: data });
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({ success: false, message: "Team Message not fetched" });
  }
};
