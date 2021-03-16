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

//ON CONNECTION WITH CLIENT
io.on("connection", (socket) => {
  const key = db.collection("keys").find();
  if (!key) {
    let msg = false;
    socket.emit("key", msg);
    console.log("no key!");
  }
  //variable for history of messages
  const msgHistory = db.collection("messages");

  //variable for Admin Client Count
  const count = io.engine.clientsCount;
  socket.to("admin").emit("clients", count);

  //console.log when new User connects
  console.log(`${socket.id} is connected`);

  //handle disconnect
  socket.on("disconnect", () => {
    const count = io.engine.clientsCount;
    socket.to("admin").emit("clients", count);
  });

  //sets the room depending on the room-state of the client and emits accordingly
  socket.on("room", (data) => {
    console.log(socket.id + " joined " + data.room);
    console.log(data);
    socket.join(data.room);

    switch (data.room) {
      //log-in to Chat, sends message-history from MongoDB
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
      //log-in to Files
      case "files":
        console.log("files connected");
        break;

      //log-in to Admin, sends message-history-length from MongoDB
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
      //log-in to Home
      case "home":
        console.log("home connected");
    }
  });
  //when client leaves specific room
  socket.on("leaving room", (data) => {
    console.log(socket.id + " left " + data.room);
    socket.leave(data.room);
  });

  //when new Message is sent. sends new message to everyone in /Chat, except sender and updates count for admin
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
  //when Admin connects to /Admin, client-count gets updated
  socket.on("clients", () => {
    const count = io.engine.clientsCount;
    socket.emit("clients", count);
  });

  //when Admin deletes files
  socket.on("files-deleted", () => {
    io.in("files").emit("files-deleted");
    console.log("files deleted");
  });

  //when new file is uploaded
  socket.on("file-added", () => {
    io.in("files").emit("file-added");
    io.in("admin").emit("newFile");
    console.log("new file emitted");
  });
  //when admin deletes messages
  socket.on("deleteMessages", () => {
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
