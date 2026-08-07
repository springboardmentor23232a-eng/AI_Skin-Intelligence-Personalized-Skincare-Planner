const pool = require('../config/db');

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

module.exports = { getUserReports, recommendRoutine, getMyConsultations, updateConsultationStatus };
