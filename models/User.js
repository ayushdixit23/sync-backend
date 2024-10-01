const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  // organization: [String],
  organization: [
    {
      type: ObjectId,
      ref: "Organization",
    },
  ],
  email: String,
  username: String,
  jobrole: String,
  password: String,
  name: { type: String },
  // orgid: [
  //   {
  //     type: ObjectId,
  //     ref: "Organization",
  //   },
  // ],
  dp: { type: String },
  admin: Boolean,
  tasks: [{ type: ObjectId, ref: "Tasks" }],
  storage: [{ type: ObjectId, ref: "Storage" }],
  storageused: { type: Number }, //in Gbs
  assignedtasks: [
    {
      task: { type: ObjectId, ref: "Assigntasks" },
      team: { type: ObjectId, ref: "Team" },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
