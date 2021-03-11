const db = require("./dbConfig");
// const PORT = require("./serverConfig");
const app = require("express")();
const httpServer = require("http").createServer(app);
const server = require("./serverConfig");
const PORT = server.PORT;
const options = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};
const io = require("socket.io")(httpServer, options);

io.on("connect", (socket) => {
  const msgHistory = db.collection("messages");
  //console.log when new User connects
  console.log(`${socket.id} is connected`);
  msgHistory
    .find({})
    .sort({ _id: 1 })
    .toArray((err, res) => {
      if (err) {
        throw err;
      }
      socket.emit("history", res);
      console.log("history emitted");
    });
  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} has disconnected`);
  });

  socket.on("newFile", () => {
    io.emit("loadNewFile");
  });

  //emits Chat-History from local MongoDB to User when Room is joined
  socket.on("room", (data) => {
    console.log("join room");
    console.log(data);
    socket.join(data.room);
    msgHistory
      .find({})
      .sort({ _id: 1 })
      .toArray((err, res) => {
        if (err) {
          throw err;
        }
        socket.emit("history", res);
        console.log("history emitted");
      });
  });

  socket.on("leave room", (data) => {
    console.log("leaving room");
    console.log(data);
    socket.leave(data.room);
  });
  socket.on("newMessage", (message) => {
    msgHistory.insertOne({
      content: message.content,
      username: message.username,
    });
    socket.broadcast.to("chat-room").emit("receiveNewMessage", {
      content: message.content,
      username: message.username,
    });
  });
});

httpServer.listen(PORT, console.log(`Server running on port ${PORT}`));
