const pool = require('../config/db');
const { computeChanges } = require('../utils/routineGenerator');

// GET /api/consultant/reports
async function getUserReports(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT sr.*, u.name AS patient_name, u.email AS patient_email
       FROM skin_reports sr
       JOIN users u ON u.id = sr.user_id
       WHERE sr.user_id IN (
         SELECT DISTINCT user_id FROM appointments WHERE provider_id = $1
       ) OR sr.reviewed_by = $1
       ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    res.json({ reports: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/consultant/users
// Users this consultant can monitor: anyone who has booked an appointment
// with them, or whose report they've reviewed. Includes a quick snapshot
// (latest score, latest assessment date) for the users list view.
async function getMonitoredUsers(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.skin_type,
         latest.skin_health_score AS latest_score,
         latest.created_at AS latest_assessment_at
       FROM users u
       LEFT JOIN LATERAL (
         SELECT skin_health_score, created_at
         FROM skin_reports
         WHERE user_id = u.id
         ORDER BY created_at DESC
         LIMIT 1
       ) latest ON TRUE
       WHERE u.id IN (
         SELECT DISTINCT user_id FROM appointments WHERE provider_id = $1
         UNION
         SELECT DISTINCT user_id FROM skin_reports WHERE reviewed_by = $1
       )
       ORDER BY u.name`,
      [req.user.id]
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/consultant/users/:userId/progress
// Full monitoring view for one user: overview, full assessment history
// (for the progress graph + history table), and their current routine.
// Access is limited to users this consultant already has a relationship
// with (via appointment or a reviewed report) — same rule as getUserReports.
async function getUserProgress(req, res, next) {
  try {
    const { userId } = req.params;

    const accessCheck = await pool.query(
      `SELECT 1 WHERE EXISTS (
         SELECT 1 FROM appointments WHERE provider_id = $1 AND user_id = $2
         UNION
         SELECT 1 FROM skin_reports WHERE reviewed_by = $1 AND user_id = $2
       )`,
      [req.user.id, userId]
    );
    if (!accessCheck.rows.length) {
      return res.status(403).json({ message: 'You do not have access to this user\u2019s progress.' });
    }

    const userResult = await pool.query('SELECT id, name, email, skin_type FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const reportsResult = await pool.query(
      'SELECT * FROM skin_reports WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const reports = reportsResult.rows;

    const planResult = await pool.query(
      'SELECT * FROM skincare_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const latest = reports[0] || null;
    const previous = reports[1] || null;
    const changes = computeChanges(previous, latest);

    res.json({
      user,
      latest_report: latest,
      previous_report: previous,
      changes,
      assessment_history: reports,
      current_plan: planResult.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/consultant/reports/:id/recommend
async function recommendRoutine(req, res, next) {
  try {
    const { recommendations, doctor_notes } = req.body;
    if (!recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({ message: 'recommendations must be an array.' });
    }

    const { rows } = await pool.query(
      `UPDATE skin_reports
       SET recommendations = $1, doctor_notes = COALESCE($2, doctor_notes),
           status = 'REVIEWED', reviewed_by = $3
       WHERE id = $4 RETURNING *`,
      [JSON.stringify(recommendations), doctor_notes, req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Report not found.' });
    res.json({ message: 'Recommendations updated.', report: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/consultant/appointments
async function getMyConsultations(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.name AS patient_name, u.email AS patient_email
       FROM appointments a JOIN users u ON u.id = a.user_id
       WHERE a.provider_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );
    res.json({ appointments: rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/consultant/appointments/:id/status
async function updateConsultationStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const { rows } = await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2 AND provider_id = $3 RETURNING *`,
      [status, req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Appointment not found.' });
    res.json({ message: 'Consultation updated.', appointment: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserReports,
  getMonitoredUsers,
  getUserProgress,
  recommendRoutine,
  getMyConsultations,
  updateConsultationStatus,
};
