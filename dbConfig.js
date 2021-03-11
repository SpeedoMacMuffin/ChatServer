const mongoose = require("mongoose");
const server = require("./serverConfig");

mongoose.connect(`mongodb://${server.dbURL}:27017/deadnode`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;

db.on("connected", function () {
  console.log("database is connected successfully");
});
db.on("disconnected", function () {
  console.log("database is disconnected successfully");
});
db.on("error", console.error.bind(console, "connection error:"));

module.exports = db;
