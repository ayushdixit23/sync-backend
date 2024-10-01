const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const AssignTaskSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    assignedBy: { type: ObjectId, ref: "User" },
    orgid: { type: ObjectId, ref: "Organization" },
    assignedteams: [{ type: ObjectId, ref: "Team" }],
    assignedusers: [{ type: ObjectId, ref: "User" }],
    assignedAt: { type: Date, default: Date.now },
    progress: { type: String, default: "Not Started" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assigntasks", AssignTaskSchema);
