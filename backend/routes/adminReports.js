const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

function paging(query) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

function csv(value) {
  return `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
}

router.use(authMiddleware, requireRole('admin'));

// Organization-wide counts and recent activity.
router.get('/summary', async (req, res, next) => {
  try {
    const [users, reports, assessments] = await Promise.all([
      pool.query(`SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`),
      pool.query(`SELECT COUNT(*)::int AS total,
                         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days
                  FROM user_reports`),
      pool.query(`SELECT COUNT(*)::int AS total,
                         ROUND(AVG(skin_health_score))::int AS average_score
                  FROM skin_assessments`)
    ]);
    return res.json({
      success: true,
      summary: {
        usersByRole: users.rows.reduce((out, row) => { out[row.role] = row.count; return out; }, {}),
        reports: reports.rows[0],
        assessments: assessments.rows[0]
      }
    });
  } catch (error) {
    return next(error);
  }
});

// List every report in the organization, without exposing report_data by default.
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset } = paging(req.query);
    const params = [limit, offset];
    const filters = [];
    if (req.query.reportType) {
      params.push(req.query.reportType);
      filters.push(`r.report_type = $${params.length}`);
    }
    if (req.query.search) {
      params.push(`%${String(req.query.search).trim()}%`);
      filters.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (req.query.startDate) {
      params.push(req.query.startDate);
      filters.push(`r.created_at >= $${params.length}::date`);
    }
    if (req.query.endDate) {
      params.push(req.query.endDate);
      filters.push(`r.created_at < ($${params.length}::date + INTERVAL '1 day')`);
    }
    const filter = filters.length ? ` AND ${filters.join(' AND ')}` : '';
    const countParams = params.slice(2);
    const countFilter = filters.length
      ? ` AND ${filters.map((condition) => condition.replace(/\$(\d+)/g, (_, index) => `$${Number(index) - 2}`)).join(' AND ')}`
      : '';
    const [result, count] = await Promise.all([
      pool.query(`SELECT r.id, r.user_id, u.name AS user_name, u.email AS user_email,
                         r.report_type, r.report_period_start, r.report_period_end,
                         r.generated_for, r.generated_by, r.is_shared, r.version, r.created_at, r.updated_at,
                         latest.skin_health_score AS latest_score,
                         latest.overall_condition
                  FROM user_reports r
                  JOIN users u ON u.id = r.user_id
                  LEFT JOIN LATERAL (
                    SELECT skin_health_score, overall_condition
                    FROM skin_assessments
                    WHERE user_id = r.user_id
                    ORDER BY assessment_date DESC
                    LIMIT 1
                  ) latest ON true
                  WHERE TRUE${filter}
                  ORDER BY r.created_at DESC LIMIT $1 OFFSET $2`, params),
      pool.query(`SELECT COUNT(*)::int AS total
                  FROM user_reports r JOIN users u ON u.id = r.user_id
                  WHERE TRUE${countFilter}`, countParams)
    ]);
    return res.json({ success: true, reports: result.rows, pagination: { limit, offset, total: count.rows[0].total } });
  } catch (error) {
    return next(error);
  }
});

router.get('/export', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT r.id, r.user_id, u.name AS user_name, u.email AS user_email,
      r.report_type, r.report_period_start, r.report_period_end, r.created_at
      FROM user_reports r JOIN users u ON u.id = r.user_id
      WHERE ($1::text IS NULL OR r.report_type = $1) ORDER BY r.created_at DESC`, [req.query.reportType || null]);
    if (String(req.query.format || 'json').toLowerCase() !== 'csv') return res.json({ success: true, reports: result.rows });
    const keys = ['id', 'user_id', 'user_name', 'user_email', 'report_type', 'report_period_start', 'report_period_end', 'created_at'];
    const body = keys.map(csv).join(',') + '\n' + result.rows.map(row => keys.map(key => csv(row[key])).join(',')).join('\n');
    res.type('text/csv').setHeader('Content-Disposition', 'attachment; filename="organization-reports.csv"');
    return res.send(body);
  } catch (error) { return next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid report id format.' });
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, u.email AS user_email
       FROM user_reports r JOIN users u ON u.id = r.user_id WHERE r.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Report not found.' });
    return res.json({ success: true, report: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// Export report records as JSON or spreadsheet-compatible CSV.
router.get('/:id/export', async (req, res, next) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid report id format.' });
    const result = await pool.query(`SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM user_reports r JOIN users u ON u.id = r.user_id WHERE r.id = $1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Report not found.' });
    const report = result.rows[0];
    if (String(req.query.format || 'json').toLowerCase() !== 'csv') return res.json({ success: true, report });
    const keys = ['id', 'user_id', 'user_name', 'user_email', 'report_type', 'created_at', 'report_data'];
    const row = keys.map(key => csv(key)).join(',') + '\n' +
      keys.map(key => csv(key === 'report_data' ? JSON.stringify(report[key] || {}) : report[key])).join(',');
    res.type('text/csv').setHeader('Content-Disposition', `attachment; filename="report-${report.id}.csv"`);
    return res.send(row);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
