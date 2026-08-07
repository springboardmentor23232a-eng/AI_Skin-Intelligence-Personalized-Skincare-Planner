const bcrypt = require('bcrypt');
const pool = require('../config/db');

const PUBLIC_FIELDS = 'id, name, email, role, provider, avatar_url, phone, skin_type, is_active, created_at';

// GET /api/admin/users?role=USER|DOCTOR|CONSULTANT|ADMIN
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const params = [];
    let query = `SELECT ${PUBLIC_FIELDS} FROM users`;
    if (role) {
      params.push(role.toUpperCase());
      query += ' WHERE role = $1';
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users  (admin manually creates a Doctor/Consultant/Admin/User account)
async function createUser(req, res, next) {
  try {
    const { name, email, password, role, specialization } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required.' });
    }
    if (!['USER', 'DOCTOR', 'CONSULTANT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) return res.status(409).json({ message: 'Email already in use.' });

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, provider) VALUES ($1, $2, $3, $4, 'LOCAL')
       RETURNING ${PUBLIC_FIELDS}`,
      [name, email, hashed, role]
    );
    const user = rows[0];

    if (role === 'DOCTOR') {
      await pool.query('INSERT INTO doctor_profiles (user_id, specialization) VALUES ($1, $2)', [
        user.id,
        specialization || 'General Dermatology',
      ]);
    } else if (role === 'CONSULTANT') {
      await pool.query('INSERT INTO consultant_profiles (user_id, specialization) VALUES ($1, $2)', [
        user.id,
        specialization || 'Skincare & Product Consultant',
      ]);
    }

    res.status(201).json({ message: 'User created.', user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id  (update role / active status)
async function updateUser(req, res, next) {
  try {
    const { role, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET role = COALESCE($1, role), is_active = COALESCE($2, is_active), updated_at = NOW()
       WHERE id = $3 RETURNING ${PUBLIC_FIELDS}`,
      [role, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated.', user: rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/reports
async function getAllReports(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT sr.*, u.name AS patient_name, u.email AS patient_email, r.name AS reviewer_name
       FROM skin_reports sr
       JOIN users u ON u.id = sr.user_id
       LEFT JOIN users r ON r.id = sr.reviewed_by
       ORDER BY sr.created_at DESC`
    );
    res.json({ reports: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/appointments
async function getAllAppointments(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.name AS patient_name, p.name AS provider_name
       FROM appointments a
       JOIN users u ON u.id = a.user_id
       JOIN users p ON p.id = a.provider_id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );
    res.json({ appointments: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const [users, doctors, consultants, reports, appointments, avgScore] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'USER'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'DOCTOR'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'CONSULTANT'"),
      pool.query('SELECT COUNT(*) FROM skin_reports'),
      pool.query('SELECT COUNT(*) FROM appointments'),
      pool.query('SELECT ROUND(AVG(skin_health_score)) AS avg FROM skin_reports'),
    ]);

    const appointmentsByStatus = await pool.query(
      'SELECT status, COUNT(*) FROM appointments GROUP BY status'
    );

    res.json({
      totalUsers: Number(users.rows[0].count),
      totalDoctors: Number(doctors.rows[0].count),
      totalConsultants: Number(consultants.rows[0].count),
      totalReports: Number(reports.rows[0].count),
      totalAppointments: Number(appointments.rows[0].count),
      averageSkinHealthScore: Number(avgScore.rows[0].avg) || 0,
      appointmentsByStatus: appointmentsByStatus.rows.reduce((acc, r) => {
        acc[r.status] = Number(r.count);
        return acc;
      }, {}),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllReports,
  getAllAppointments,
  getStats,
};
