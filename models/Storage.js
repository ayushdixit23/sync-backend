const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const storageSchema = new mongoose.Schema(
  {
    orgid: { type: ObjectId, ref: "Organization" },
    userid: { type: ObjectId, ref: "User" },
    storage: {
      filename: String,
      filestorage: String,
      buffer: Buffer,
    },
    filename: { type: String },
    date: { type: Date, default: Date.now },
    size: { type: Number, default: 0 }, //kb
    objectName: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Storage", storageSchema);
