const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const teamSchema = new mongoose.Schema({
  admin: { type: ObjectId, ref: "User" },
  email: { type: String, required: true },
  code: { type: String },
  teamname: { type: String },
  members: [{ type: ObjectId, ref: "User" }],
  totalMembers: { type: Number },
  organization: {
    id: { type: ObjectId, ref: "Organization" },
    name: { type: String },
  },
  messages: [
    {
      type: ObjectId,
      ref: "Message",
    },
  ],
  assignedtasks: [{ type: ObjectId, ref: "Assigntasks" }],
});
module.exports = mongoose.model("Team", teamSchema);
