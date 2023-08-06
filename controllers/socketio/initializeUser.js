const redisClient = require("../../redis");
const parseFriendList = require("./parseFriendList");
const CryptoJS = require('crypto-js');
require("dotenv").config()
const secretKey = process.env.CRYPTO_SECRET;

const initializeUser = async socket => {
  socket.join(socket.user.userid);

  await redisClient.hset(
    `userid:${socket.user.username}`,
    "userid",
    socket.user.userid
  )

  await redisClient.hset(
    `userid:${socket.user.username}`,
    "connected",
    true
  )

  const friendList = await redisClient.lrange(
    `friends:${socket.user.username}`,
    0,
    -1
  );
  const parsedFriendList = await parseFriendList(friendList);
  
  const friendRooms = parsedFriendList.map(friend => friend.userid);

  if (friendRooms.length > 0) {
    socket.to(friendRooms).emit("connected", true, socket.user.username);
  }

  socket.emit("friends", parsedFriendList);

  const msgQuery = await redisClient.lrange(
    `chat:${socket.user.userid}`,
    0,
    -1
  );

  const messages = msgQuery.map(msgStr => {
    const parsedStr = msgStr.split("|*|");
    const decryptedMessage = CryptoJS.AES.decrypt(parsedStr[2], secretKey).toString(CryptoJS.enc.Utf8);
    return { to: parsedStr[0], from: parsedStr[1], content: decryptedMessage, time:parsedStr[3] };
  });

  socket.emit("messages", messages);
  
};

module.exports = initializeUser;
