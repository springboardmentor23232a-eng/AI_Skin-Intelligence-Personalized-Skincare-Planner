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

router.use(authMiddleware, requireRole('dermatologist'));

// Reports belonging to patients actively assigned/shared with this dermatologist.
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset } = paging(req.query);
    const params = [req.user.id, limit, offset];
    const typeFilter = req.query.reportType ? ' AND r.report_type = $4' : '';
    if (req.query.reportType) params.push(req.query.reportType);
    const [result, count] = await Promise.all([
      pool.query(`SELECT r.id, r.user_id, u.name AS patient_name, u.email AS patient_email,
                         r.report_type, r.report_period_start, r.report_period_end,
                         r.generated_for, r.is_shared, r.version, r.created_at, r.updated_at,
                         latest.skin_health_score AS latest_score,
                         latest.overall_condition
                  FROM user_reports r
                  JOIN users u ON u.id = r.user_id
                  JOIN care_team_shares s ON s.user_id = r.user_id
                    AND s.professional_id = $1 AND s.status = 'active'
                  LEFT JOIN LATERAL (
                    SELECT skin_health_score, overall_condition
                    FROM skin_assessments
                    WHERE user_id = r.user_id
                    ORDER BY assessment_date DESC
                    LIMIT 1
                  ) latest ON true
                  WHERE u.role = 'user' AND u.is_active = true${typeFilter}
                  ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`, params),
      pool.query(`SELECT COUNT(*)::int AS total
                  FROM user_reports r JOIN users u ON u.id = r.user_id
                  JOIN care_team_shares s ON s.user_id = r.user_id
                    AND s.professional_id = $1 AND s.status = 'active'
                  WHERE u.role = 'user' AND u.is_active = true${req.query.reportType ? ' AND r.report_type = $2' : ''}`,
        [req.user.id].concat(req.query.reportType ? [req.query.reportType] : []))
    ]);
    return res.json({ success: true, reports: result.rows, pagination: { limit, offset, total: count.rows[0].total } });
  } catch (error) {
    return next(error);
  }
});

router.get('/patients', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT u.id, u.name, u.email, COUNT(r.id)::int AS report_count,
       MAX(r.created_at) AS latest_report_at
       FROM users u JOIN care_team_shares s ON s.user_id = u.id
       LEFT JOIN user_reports r ON r.user_id = u.id
       WHERE s.professional_id = $1 AND s.status = 'active' AND u.role = 'user' AND u.is_active = true
       GROUP BY u.id, u.name, u.email ORDER BY u.name`, [req.user.id]);
    return res.json({ success: true, patients: result.rows });
  } catch (error) { return next(error); }
});

router.get('/export', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT r.id, r.user_id, u.name AS patient_name, u.email AS patient_email,
      r.report_type, r.report_period_start, r.report_period_end, r.created_at
      FROM user_reports r JOIN users u ON u.id = r.user_id
      JOIN care_team_shares s ON s.user_id = r.user_id AND s.professional_id = $1 AND s.status = 'active'
      WHERE u.role = 'user' AND u.is_active = true ORDER BY r.created_at DESC`, [req.user.id]);
    if (String(req.query.format || 'json').toLowerCase() !== 'csv') return res.json({ success: true, reports: result.rows });
    const keys = ['id', 'user_id', 'patient_name', 'patient_email', 'report_type', 'report_period_start', 'report_period_end', 'created_at'];
    const body = keys.map(csv).join(',') + '\n' + result.rows.map(row => keys.map(key => csv(row[key])).join(',')).join('\n');
    res.type('text/csv').setHeader('Content-Disposition', 'attachment; filename="dermatologist-reports.csv"');
    return res.send(body);
  } catch (error) { return next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid report id format.' });
    const result = await pool.query(`SELECT r.*, u.name AS patient_name, u.email AS patient_email
      FROM user_reports r JOIN users u ON u.id = r.user_id
      JOIN care_team_shares s ON s.user_id = r.user_id AND s.professional_id = $2 AND s.status = 'active'
      WHERE r.id = $1 AND u.role = 'user'`, [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Report not found or patient is not assigned.' });
    return res.json({ success: true, report: result.rows[0] });
  } catch (error) { return next(error); }
});

router.get('/:id/export', async (req, res, next) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid report id format.' });
    const result = await pool.query(`SELECT r.*, u.name AS patient_name, u.email AS patient_email
      FROM user_reports r JOIN users u ON u.id = r.user_id
      JOIN care_team_shares s ON s.user_id = r.user_id AND s.professional_id = $2 AND s.status = 'active'
      WHERE r.id = $1 AND u.role = 'user'`, [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Report not found or patient is not assigned.' });
    const report = result.rows[0];
    if (String(req.query.format || 'json').toLowerCase() !== 'csv') return res.json({ success: true, report });
    const keys = ['id', 'user_id', 'patient_name', 'patient_email', 'report_type', 'created_at', 'report_data'];
    const body = keys.map(csv).join(',') + '\n' + keys.map(key => csv(key === 'report_data' ? JSON.stringify(report[key] || {}) : report[key])).join(',');
    res.type('text/csv').setHeader('Content-Disposition', `attachment; filename="patient-report-${report.id}.csv"`);
    return res.send(body);
  } catch (error) { return next(error); }
});

module.exports = router;
