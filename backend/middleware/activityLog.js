const pool = require('../db/pool');

function activityLog(req, res, next) {
  res.on('finish', () => {
    if (!req.user?.id || !req.path.startsWith('/api/')) return;
    pool.query(
      `INSERT INTO user_activity_log (user_id, method, path, status_code)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.method, req.path, res.statusCode]
    ).catch((error) => {
      console.error('User activity log error:', error);
    });
  });
  next();
}

module.exports = activityLog;
