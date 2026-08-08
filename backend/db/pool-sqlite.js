const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database as fallback
const dbPath = path.join(__dirname, '../../skin_intelligence.db');
const db = new sqlite3.Database(dbPath);

// Promisify the database methods
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
        });
    });
};

const get = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const run = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ rows: [], rowCount: this.changes });
        });
    });
};

module.exports = {
    query,
    get,
    run,
    close: () => db.close()
};
