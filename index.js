const express = require("express");
const { Server } = require("socket.io");
const app = express();
const redisClient = require("./redis");
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./router/authRouter");
const { corsConfig } = require("./controllers/serverController");
const { authorizeUser, initializeUser, addFriend, onDisconnect, dm } = require("./controllers/socketController");
require("dotenv").config();
const CryptoJS = require('crypto-js');
const secretKey = process.env.CRYPTO_SECRET;

const getKeys = async () => {
  const keys = await redisClient.keys("*");

  await Promise.all(
    keys.map(async (key) => {
      if (key.includes("chat")) {
        const valueArray = await redisClient.lrange(key, 0, -1);

        const replacedValueArray = valueArray.map((value) =>
          value.replace(/\^/g, '|*|')
        );

        const encryptedValueArray = replacedValueArray.map((value) => {
          const encryptedContent = CryptoJS.AES.encrypt(value.split("|*|")[2], secretKey).toString();
          return `${value.split("|*|")[0]}|*|${value.split("|*|")[1]}|*|${encryptedContent}|*|${value.split("|*|")[3]}`;
        });

        await redisClient.del(key);

        await redisClient.lpush(key, ...encryptedValueArray);

        const newValueArray = await redisClient.lrange(key, 0, -1);

        console.log(newValueArray);
      }else if(key.includes("friends")) {
        const valueArray = await redisClient.lrange(key, 0, -1);

        const replacedValueArray = valueArray.map((value) =>
        value.replace(/\^/g, '|*|')
      );

      await redisClient.del(key);

      await redisClient.lpush(key, replacedValueArray);

      const newValueArray = await redisClient.lrange(key, 0, -1);
      console.log(newValueArray);

      }
    }
  )
)
};

getKeys();






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

