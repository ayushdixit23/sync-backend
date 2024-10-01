const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const TaskSchema = new mongoose.Schema(
  {
    text: { type: String },
    creator: { type: ObjectId, ref: "User" },
    assignedby: { type: ObjectId, ref: "User" },
    orgid: { type: ObjectId, ref: "Organization" },
    status: { type: String, default: "pending" },
    isactive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tasks", TaskSchema);
