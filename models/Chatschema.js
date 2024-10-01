const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const chatSchema = new mongoose.Schema({
  convId: { type: String, required: true },
  senderid: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  receiverid: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Chats", chatSchema);
