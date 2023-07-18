const Redis = require("ioredis");
require("dotenv").config()

const redisClient = new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT || 6379,
});

module.exports = redisClient;