const db = require("./dbConfig");
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

io.on("connection", (socket) => {
  const msgHistory = db.collection("messages");
  //console.log when new User connects
  console.log(`${socket.id} is connected`);
  // msgHistory
  //   .find({})
  //   .sort({ _id: 1 })
  //   .toArray((err, res) => {
  //     if (err) {
  //       throw err;
  //     }
  //     socket.emit("history", res);
  //     console.log("history emitted");
  //   });
  // socket.on("disconnect", (reason) => {
  //   console.log(`${socket.id} has disconnected`);
  // });

  //emits Chat-History from local MongoDB to User when Room is joined
  socket.on("room", (data) => {
    console.log(socket.id + " joined " + data.room);
    console.log(data);
    socket.join(data.room);

    switch (data.room) {
      case "chat":
        console.log("chat connected");
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
        break;
      case "files":
        console.log("files connected");
        break;
      case "admin":
        console.log("admin connected");
        msgHistory.find({}).count((err, res) => {
          if (err) {
            throw err;
          }
          socket.emit("admin", res);
          console.log("message count sent");
        });
    }
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

  socket.on("leaving room", (data) => {
    console.log(socket.id + " left " + data.room);
    socket.leave(data.room);
  });

  socket.on("admin-stats", () => {
    const count = io.engine.clientsCount;
    socket.emit("admin-stats", count);
    console.log(count);
  });
  socket.on("admin", () => {
    // console.log("admin connected");
    // msgHistory.find({}).count((err, res) => {
    //   if (err) {
    //     throw err;
    //   }
    //   socket.emit("admin", res);
    //   console.log("message count sent");
    // });
  });

  socket.on("delete", () => {
    msgHistory.deleteMany({});
    setTimeout(() => {
      msgHistory
        .find({})
        .sort({ _id: 1 })
        .toArray((err, res) => {
          if (err) {
            throw err;
          }
          socket.broadcast.to("chat").emit("history", res);
          console.log("history deleted");
        });
    }, 2000);
  });
  //emits to all sockets when upload-folder gets changed
  socket.on("files-change", (file) => {
    socket.in("files").emit("loadNewFile", file);
    console.log(file);
  });
});

httpServer.listen(PORT, console.log(`Server running on port ${PORT}`));
