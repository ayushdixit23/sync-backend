const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const orgSchema = new mongoose.Schema({
  title: String,
  profile: { type: String },
  creator: { type: ObjectId, ref: "User" },
  users: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  userscount: Number,
  taskscount: Number,
  code: { type: String },
  teams: [{ type: ObjectId, ref: "Team" }],
  tasks: [{ type: ObjectId, ref: "Tasks" }],
  storage: [{ type: ObjectId, ref: "Storage" }],
  storageused: { type: Number, default: 0 }, //in Gbs
});

module.exports = mongoose.model("Organization", orgSchema);
