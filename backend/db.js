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


pool.connect()

.then(() => {

    console.log("PostgreSQL Connected Successfully");

})

.catch((error)=>{

    console.log("Database Connection Error:", error);

});


module.exports = pool;