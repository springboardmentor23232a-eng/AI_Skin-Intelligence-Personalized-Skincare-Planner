#!/bin/sh
set -e

echo "Waiting for PostgreSQL at ${PGHOST:-postgres}:${PGPORT:-5432}..."
ATTEMPTS=0
until node -e "
  const { Client } = require('pg');
  const c = new Client();
  c.connect().then(() => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
"; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    echo "PostgreSQL did not become ready in time." >&2
    exit 1
  fi
  sleep 2
done
echo "PostgreSQL is ready."

# schema.sql uses CREATE TABLE/TYPE IF NOT EXISTS and the demo-account seed
# uses ON CONFLICT DO NOTHING, so re-running this on every container start
# is safe and never destroys existing data.
echo "Running schema + demo seed (idempotent)..."
node src/db/init.js

echo "Starting API server..."
exec node server.js
