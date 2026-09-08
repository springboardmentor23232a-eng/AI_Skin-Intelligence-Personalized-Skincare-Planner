/* eslint-disable no-unused-vars */
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // Postgres 42703 = undefined_column. This happens when backend code
  // expects a column that schema.sql defines (e.g. the Skin Health
  // Scoring Engine's water_intake_liters/sleep_hours/stress_level/
  // concern_severity/manual_skin_assessed on user_skincare_preferences)
  // but the running database was never migrated to add it. The fix is
  // always the same — apply schema.sql — so surface that directly
  // instead of a generic 500, without hiding the underlying error.
  if (err.code === '42703') {
    console.error('→ This looks like a missing-column error. Run "npm run db:migrate" (or "npm run db:init" on a fresh database) to bring the schema up to date, then retry.');
    return res.status(500).json({
      message: 'Database schema is out of date for this request. Run "npm run db:migrate" on the backend and try again.',
      detail: err.message,
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error.',
  });
}

module.exports = { notFound, errorHandler };
