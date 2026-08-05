const { Pool } = require("pg");
require("dotenv").config();


const pool = new Pool({

    user: process.env.DB_USER,

    host: process.env.DB_HOST,

    database: process.env.DB_NAME,

    password: process.env.DB_PASSWORD,

    port: process.env.DB_PORT

});


pool.connect()

.then(() => {

    console.log("PostgreSQL Connected Successfully");

})

.catch((error)=>{

    console.log("Database Connection Error:", error);

});


module.exports = pool;