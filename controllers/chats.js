const Chat = require("../models/Chatschema");

exports.chats = async (req, res) => {
  try {
    const data = await Chat.find();
    res.status(200).json(data);
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: "Chat not fetched", message: e.message });
  }
};
