const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  sudo: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
