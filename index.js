const express = require("express");
const { Server } = require("socket.io");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./router/authRouter");
const { sessionMiddleWare, wrap, corsConfig } = require("./controllers/serverController");
const { authorizeUser, initializeUser, addFriend, onDisconnect, dm } = require("./controllers/socketController");
require("dotenv").config();

const server = require("http").createServer(app);

const io = new Server(server, { cors: corsConfig });

app.use(helmet());

app.use(cors(corsConfig));

app.use(express.json());

app.use(sessionMiddleWare);

app.options("/auth/login", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://chat-pheonix.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

app.options("/auth/register", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://chat-pheonix.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});


app.use("/auth", authRouter);

app.set("trust proxy", 1);

app.get("/", (req, res) => {
  res.json("Lol");
});

io.use(wrap(sessionMiddleWare));

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
  console.log(`Server is listening to port ${process.env.PORT || "4000"}`);
});
