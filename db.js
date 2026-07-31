const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "GlowSenseAI",
    password: "iswarya@123",
    port: 5432
});

pool.connect()
    .then(() => {
        console.log("PostgreSQL connected successfully!");
    })
    .catch((err) => {
        console.error("PostgreSQL connection error:", err.message);
    });

module.exports = pool;