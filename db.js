const {Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString:process.env.POSTGRES_URL,
    database:process.env.POSTGRES_DATABASE,
    host:process.env.POSTGRES_HOST,
    password:process.env.POSTGRES_PASSWORD,
    user:process.env.POSTGRES_USER,
    port:process.env.POSTGRES_PORT
})

module.exports = pool;