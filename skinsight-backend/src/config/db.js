const { Pool } = require('pg');

// Supports either a single DATABASE_URL (e.g. on Render/Railway/Supabase)
// or the individual PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD vars.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    });

pool.on('connect', () => console.log('🔗 PostgreSQL connected'));
pool.on('error', (err) => console.error('PostgreSQL pool error:', err.message));

module.exports = pool;
