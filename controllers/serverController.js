const session = require("express-session");
const redisClient = require("../redis");
const RedisStore = require("@goberman/connect-redis")(session);
require("dotenv").config();

const sessionMiddleWare = session({
  secret: process.env.COOKIE_SECRET,
  credentials: true,
  name: "$id",
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production" ? "true" : "auto",
    httpOnly: true,
    expires: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

const wrap = (expressMiddleWare) => (socket, next) =>
  expressMiddleWare(socket.request, {}, next);

const corsConfig = {
  origin:process.env.CLIENT_URL,
  credentials: true,
};

module.exports = { sessionMiddleWare, wrap, corsConfig };
