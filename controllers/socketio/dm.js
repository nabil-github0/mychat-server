const redisClient = require("../../redis");
const CryptoJS = require('crypto-js');
require("dotenv").config()
const secretKey = process.env.CRYPTO_SECRET;

const dm = async (socket, message) => {
  message.from = socket.user.userid;

  const encryptedMessage = CryptoJS.AES.encrypt(message.content, secretKey).toString();

  const messageString = [message.to, message.from, encryptedMessage, message.time].join(
    "|*|"
  );

  await redisClient.lpush(`chat:${message.to}`, messageString);
  await redisClient.lpush(`chat:${message.from}`, messageString);

  socket.to(message.to).emit("dm", message);
};

module.exports = dm;