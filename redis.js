const Redis = require("ioredis");
require("dotenv").config()

const redisClient = new Redis(process.env.KV_URL);

module.exports = redisClient;