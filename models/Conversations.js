const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: ObjectId, ref: "User" }],
    message: [{ type: ObjectId, ref: "Message" }],
    // first: { type: ObjectId, ref: "User" },
    // second: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
