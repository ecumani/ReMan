const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "onan",
  host: "localhost",
  port: 5432,
  database: "reman",
});

module.exports = pool;
