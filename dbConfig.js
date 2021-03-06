const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://localhost:27017/DeadNode",
  (err, db) => {
    if (err) {
      throw err;
    }
    console.log("MongoDB connected...");
  },
  {
    useNewUrlParser: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.info("Mongoose successfully connected");
});

module.exports = db;
