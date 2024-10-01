const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: ObjectId,
      ref: "Conversation",
    },
    teamconvId: {
      type: ObjectId,
      ref: "Team",
    },
    // teamsender: {
    //   type: ObjectId,
    //   ref: "User",
    // },
    // teamreceiver: {
    //   type: ObjectId,
    //   ref: "User",
    // },
    sender: {
      type: ObjectId,
      ref: "User",
    },
    receiver: {
      type: ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
    mesId: { type: Number, required: true },

    typ: { type: String, default: "message" },
    status: { type: String, default: "active" },

    deletedfor: [{ type: ObjectId, ref: "User" }],
    video: { type: String },
    audio: { type: String },
    doc: { type: String },
    contact: { type: String },
    reply: { type: String },
    replyId: { type: Number },
    orgid: { type: ObjectId, ref: "Organization" },
    sequence: { type: Number },
    timestamp: { type: String },
    isread: { type: Boolean, default: false },
    readby: [{ type: ObjectId, ref: "User" }],
    desc: { type: String },
    forwardid: { type: String },
  },
  { timestamps: true, strictPopulate: false }
);

messageSchema.index({ mesId: "Regular" });
messageSchema.index({ topicId: "Regular" });
messageSchema.index({ sequence: "Regular" });

module.exports = mongoose.model("Message", messageSchema);
