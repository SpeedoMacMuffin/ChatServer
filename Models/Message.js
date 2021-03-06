const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  content: String,
  // date: { type: Date, default: Date },
  username: String,
});

module.exports = mongoose.model("Message", MessageSchema);
