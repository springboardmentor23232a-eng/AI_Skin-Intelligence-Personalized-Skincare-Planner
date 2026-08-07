const path = require('path');
const { Pool } = require('pg');

// Load backend/.env using a path anchored to THIS file's location, not the
// process's current working directory. This is the actual bug: server.js
// and db/init.js both called the plain `require('dotenv').config()`, which
// only finds .env when the process happens to be launched with its cwd set
// to backend/. Any other launch context (VS Code terminal opened at the
// repo root, an npm script run from elsewhere, etc.) causes dotenv to fail
// to find the file — silently, with no warning — leaving every PG* env var
// undefined. That's exactly what produces
// "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string":
// pg throws that specific message when `password` is `undefined`, not just
// wrong. Resolving the path here makes env loading work no matter where
// `npm run dev` / `npm run db:init` is invoked from.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Accept both naming conventions: PG*-prefixed (this project's .env.example)
// and DB_*-prefixed (a common alternate convention some tutorials/boilerplates
// use), in case either the .env file or something copied into it used the
// other one. PG* wins if both happen to be set.
const host = process.env.PGHOST || process.env.DB_HOST || 'localhost';
const port = process.env.PGPORT || process.env.DB_PORT || 5432;
const user = process.env.PGUSER || process.env.DB_USER || 'postgres';
const password = process.env.PGPASSWORD ?? process.env.DB_PASSWORD;
const database = process.env.PGDATABASE || process.env.DB_NAME || 'ai_skin_intelligence';

// Fail fast with a message that actually explains the problem, instead of
// letting `pg` throw the cryptic SASL error the first time a query runs.
if (typeof password !== 'string' || password.length === 0) {
  throw new Error(
    'PostgreSQL password was not found in the environment. Checked PGPASSWORD ' +
    'and DB_PASSWORD. Fix: make sure backend/.env exists (copy it from ' +
    '.env.example if you have not), sits directly in the backend/ folder, ' +
    'and has a line like PGPASSWORD=your_actual_password with no surrounding ' +
    'quotes and no trailing spaces.'
  );
}

const pool = new Pool({
  host,
  port: Number(port),
  user,
  password: String(password),
  database,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
  process.exit(1);
});

module.exports = pool;
