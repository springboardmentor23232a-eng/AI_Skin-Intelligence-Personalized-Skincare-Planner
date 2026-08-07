const pool = require('../config/db');

// GET /api/doctor/patients
// "Assigned patients" = users who have booked an appointment with this doctor.
async function getAssignedPatients(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email, u.phone, u.skin_type
       FROM appointments a
       JOIN users u ON u.id = a.user_id
       WHERE a.provider_id = $1
       ORDER BY u.name`,
      [req.user.id]
    );
    res.json({ patients: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/doctor/reports
// All reports belonging to patients who have an appointment with this doctor,
// plus any report this doctor has already reviewed.
async function getPatientReports(req, res, next) {
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

// PUT /api/doctor/reports/:id/diagnosis
async function addDiagnosis(req, res, next) {
  try {
    const { doctor_notes } = req.body;
    if (!doctor_notes) return res.status(400).json({ message: 'doctor_notes is required.' });

    const { rows } = await pool.query(
      `UPDATE skin_reports SET doctor_notes = $1, status = 'REVIEWED', reviewed_by = $2
       WHERE id = $3 RETURNING *`,
      [doctor_notes, req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Report not found.' });
    res.json({ message: 'Diagnosis added.', report: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/doctor/appointments
async function getMyAppointments(req, res, next) {
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

// PUT /api/doctor/appointments/:id/status
async function updateAppointmentStatus(req, res, next) {
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
    res.json({ message: 'Appointment updated.', appointment: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAssignedPatients, getPatientReports, addDiagnosis, getMyAppointments, updateAppointmentStatus };
