const { Pool } = require("pg");
require("dotenv").config();

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "skin_ai_db",
        password: process.env.DB_PASSWORD || "",
        port: process.env.DB_PORT || 5432
      };

const pool = new Pool(poolConfig);

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                role VARCHAR(50) DEFAULT 'user',
                provider VARCHAR(50) DEFAULT 'LOCAL',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("PostgreSQL Users table initialized successfully");
    } catch (err) {
        console.log("Notice: Table auto-creation notice:", err.message);
    }
};

pool.connect()
    .then(() => {
        console.log("PostgreSQL Connected Successfully");
        initDb();
    })
    .catch((error) => {
        console.log("Database Connection Warning:", error.message);
    });

module.exports = pool;