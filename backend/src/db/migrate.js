/**
 * Applies schema.sql ONLY — every CREATE TABLE IF NOT EXISTS and every
 * ALTER TABLE ... ADD COLUMN IF NOT EXISTS in it — with no reseeding of
 * demo accounts or the ingredient/product catalog. Safe and fast to
 * re-run against an EXISTING, already-populated database whenever the
 * backend code is updated to expect new columns (e.g. after pulling in
 * the Skin Health Scoring Engine's water_intake_liters/sleep_hours/
 * stress_level/concern_severity/manual_skin_assessed columns).
 *
 * This is the fix for errors like:
 *   column "water_intake_liters" of relation "user_skincare_preferences" does not exist
 * That error means the running database predates schema.sql's migration
 * for that column — the backend code was updated, but the live database
 * was never re-migrated. Run this any time you deploy backend code that
 * added new schema.sql statements.
 *
 * Non-destructive: never drops a table/column, never truncates/deletes
 * rows. Every statement in schema.sql is idempotent (IF NOT EXISTS), so
 * running this against a fully up-to-date database is a harmless no-op.
 *
 * Run with:  npm run db:migrate
 */
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function run() {
  const client = await pool.connect();
  try {
    console.log('→ Applying schema.sql (idempotent — safe on an existing database)...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✓ Schema is up to date. No existing data was modified or removed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
