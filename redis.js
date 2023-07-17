const Redis = require("ioredis");
require("dotenv").config()

const redisClient = new Redis({
    port:process.env.REDIS_PORT,
    host:process.env.REDIS_HOST
});

module.exports = redisClient;