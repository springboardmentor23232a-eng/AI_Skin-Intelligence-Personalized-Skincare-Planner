const pool = require('../config/db');
const { analyzeSkin } = require('../utils/aiAnalysis');

// POST /api/reports/upload  (multipart/form-data, field name: "image")
async function uploadAndAnalyze(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a skin image.' });
    }

    const analysis = analyzeSkin();
    const imagePath = `/uploads/${req.file.filename}`;

    const { rows } = await pool.query(
      `INSERT INTO skin_reports
        (user_id, image_path, skin_type, skin_health_score, overall_condition, concerns, risk_factors, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        imagePath,
        analysis.skin_type,
        analysis.skin_health_score,
        analysis.overall_condition,
        JSON.stringify(analysis.concerns),
        JSON.stringify(analysis.risk_factors),
        JSON.stringify(analysis.recommendations),
      ]
    );

    res.status(201).json({ message: 'Analysis complete.', report: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports  (current user's own reports)
async function getMyReports(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT sr.*, u.name AS reviewer_name
       FROM skin_reports sr
       LEFT JOIN users u ON u.id = sr.reviewed_by
       WHERE sr.user_id = $1
       ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    res.json({ reports: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/:id
async function getReportById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT sr.*, u.name AS reviewer_name FROM skin_reports sr
       LEFT JOIN users u ON u.id = sr.reviewed_by
       WHERE sr.id = $1`,
      [req.params.id]
    );
    const report = rows[0];
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    // Owner, the reviewing doctor/consultant, or an admin may view it
    const isOwner = report.user_id === req.user.id;
    const isStaff = ['DOCTOR', 'CONSULTANT', 'ADMIN'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'You do not have access to this report.' });
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/providers?role=DOCTOR|CONSULTANT
async function listProviders(req, res, next) {
  try {
    const role = req.query.role === 'CONSULTANT' ? 'CONSULTANT' : 'DOCTOR';
    const table = role === 'CONSULTANT' ? 'consultant_profiles' : 'doctor_profiles';

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, p.specialization, p.experience_years, p.bio
       FROM users u JOIN ${table} p ON p.user_id = u.id
       WHERE u.role = $1 AND u.is_active = TRUE
       ORDER BY u.name`,
      [role]
    );
    res.json({ providers: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments
async function bookAppointment(req, res, next) {
  try {
    const { provider_id, provider_role, appointment_date, appointment_time, report_id, notes } = req.body;

    if (!provider_id || !provider_role || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'provider_id, provider_role, date and time are required.' });
    }
    if (!['DOCTOR', 'CONSULTANT'].includes(provider_role)) {
      return res.status(400).json({ message: 'provider_role must be DOCTOR or CONSULTANT.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO appointments (user_id, provider_id, provider_role, report_id, appointment_date, appointment_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, provider_id, provider_role, report_id || null, appointment_date, appointment_time, notes || null]
    );
    res.status(201).json({ message: 'Appointment requested.', appointment: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/mine  (as the patient/user)
async function getMyAppointments(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.name AS provider_name
       FROM appointments a JOIN users u ON u.id = a.provider_id
       WHERE a.user_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );
    res.json({ appointments: rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/appointments/:id/cancel  (user cancels their own request)
async function cancelAppointment(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    const appt = rows[0];
    if (!appt) return res.status(404).json({ message: 'Appointment not found.' });
    if (appt.user_id !== req.user.id) return res.status(403).json({ message: 'Not your appointment.' });

    const updated = await pool.query(
      `UPDATE appointments SET status = 'CANCELLED' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ message: 'Appointment cancelled.', appointment: updated.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadAndAnalyze,
  getMyReports,
  getReportById,
  listProviders,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
};
