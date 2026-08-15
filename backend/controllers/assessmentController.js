import { pool } from '../db.js';

export async function createAssessment(req, res) {
  try {
    const userId = req.user.id;
    const { method, skin_health_score, skin_type, risk_level, form_data } = req.body;

    const result = await pool.query(
      `INSERT INTO skin_assessments (user_id, method, skin_health_score, skin_type, risk_level, form_data, assessment_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'completed', NOW())
       RETURNING *`,
      [userId, method || 'form', skin_health_score, skin_type, risk_level, JSON.stringify(form_data || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Unable to create assessment.' });
  }
}

export async function getAssessments(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM skin_assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load assessments.' });
  }
}

export async function getAssessmentById(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM skin_assessments WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load assessment.' });
  }
}

export async function updateAssessment(req, res) {
  try {
    const userId = req.user.id;
    const { skin_health_score, skin_type, risk_level, status } = req.body;
    const result = await pool.query(
      `UPDATE skin_assessments SET skin_health_score = $1, skin_type = $2, risk_level = $3, status = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [skin_health_score, skin_type, risk_level, status, req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Unable to update assessment.' });
  }
}

export async function deleteAssessment(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'DELETE FROM skin_assessments WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }
    res.json({ message: 'Assessment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete assessment.' });
  }
}

export async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, assessment_date, method, skin_health_score, skin_type, risk_level, status FROM skin_assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load assessment history.' });
  }
}

export async function addConcerns(req, res) {
  try {
    const userId = req.user.id;
    const assessmentId = req.params.id;
    const concerns = req.body.concerns || [];

    const check = await pool.query('SELECT id FROM skin_assessments WHERE id = $1 AND user_id = $2', [assessmentId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const inserted = [];
    for (const c of concerns) {
      const result = await pool.query(
        `INSERT INTO assessment_concerns (assessment_id, concern_name, severity, priority, explanation, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [assessmentId, c.concern_name, c.severity, c.priority, c.explanation]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Unable to add concerns.' });
  }
}

export async function getConcerns(req, res) {
  try {
    const userId = req.user.id;
    const assessmentId = req.params.id;

    const check = await pool.query('SELECT id FROM skin_assessments WHERE id = $1 AND user_id = $2', [assessmentId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const result = await pool.query('SELECT * FROM assessment_concerns WHERE assessment_id = $1', [assessmentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load concerns.' });
  }
}

export async function addRisks(req, res) {
  try {
    const userId = req.user.id;
    const assessmentId = req.params.id;
    const risks = req.body.risks || [];

    const check = await pool.query('SELECT id FROM skin_assessments WHERE id = $1 AND user_id = $2', [assessmentId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const inserted = [];
    for (const r of risks) {
      const result = await pool.query(
        `INSERT INTO assessment_risks (assessment_id, risk_name, severity, explanation, preventive_action, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [assessmentId, r.risk_name, r.severity, r.explanation, r.preventive_action]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: 'Unable to add risk factors.' });
  }
}

export async function getRisks(req, res) {
  try {
    const userId = req.user.id;
    const assessmentId = req.params.id;

    const check = await pool.query('SELECT id FROM skin_assessments WHERE id = $1 AND user_id = $2', [assessmentId, userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const result = await pool.query('SELECT * FROM assessment_risks WHERE assessment_id = $1', [assessmentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load risk factors.' });
  }
}
