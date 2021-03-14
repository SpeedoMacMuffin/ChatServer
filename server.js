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
  const count = io.engine.clientsCount;
  socket.to("admin").emit("clients", count);
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
  socket.on("disconnect", () => {
    const count = io.engine.clientsCount;
    socket.to("admin").emit("clients", count);
  });
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
          socket.emit("chatadmin", res);
          console.log("message count sent " + res);
        });
        break;
      case "home":
        console.log("home connected");
    }
  });

  socket.on("leaving room", (data) => {
    console.log(socket.id + " left " + data.room);
    socket.leave(data.room);
  });

  socket.on("newMessage", (message) => {
    msgHistory.insertOne({
      content: message.content,
      username: message.username,
    });
    socket.to("chat").emit("receiveNewMessage", {
      content: message.content,
      username: message.username,
    });
    msgHistory.find({}).count((err, res) => {
      if (err) {
        throw err;
      }
      io.in("admin").emit("chatadmin", res);
      console.log("message count sent");
    });
  });

  socket.on("clients", () => {
    const count = io.engine.clientsCount;
    socket.emit("clients", count);
  });
  socket.on("files-deleted", () => {
    io.in("files").emit("files-deleted");
    // socket.emit("files-change");
    console.log("files deleted");
  });
  socket.on("file-added", () => {
    io.in("files").emit("file-added");
    io.in("admin").emit("newFile");
    // socket.emit("files-change");
    console.log("new file emitted");
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
});

httpServer.listen(PORT, console.log(`Server running on port ${PORT}`));
