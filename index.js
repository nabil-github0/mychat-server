const express = require("express");
const { Server } = require("socket.io");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./router/authRouter");
const { corsConfig } = require("./controllers/serverController");
const { authorizeUser, initializeUser, addFriend, onDisconnect, dm } = require("./controllers/socketController");
require("dotenv").config();
   
const server = require("http").createServer(app);

const io = new Server(server, { cors: corsConfig });

app.use(helmet());

app.use(cors(corsConfig));

app.use(express.json());

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.json("lol");
});

io.use(authorizeUser);

io.on("connect", (socket) => {
  initializeUser(socket);
  socket.on("add_friend", (friendname, cb) => {
    addFriend(socket, friendname, cb);
  });
  socket.on("dm", (message) => dm(socket, message));
  socket.on("disconnecting", () => onDisconnect(socket));
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on ${process.env.NODE_ENV || "development"} mode`)
  console.log(`Server is listening to port ${process.env.PORT || "4000"}`);
});

