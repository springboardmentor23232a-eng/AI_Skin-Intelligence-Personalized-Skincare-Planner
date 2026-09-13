const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const TASK_IDS = ['cleanse', 'serum', 'moisturise', 'spf', 'retinol'];

function integer(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (role === 'admin') {
      const [users, active, newUsers, assessments, recentUsers, roles, recommendationStatuses] = await Promise.all([
        pool.query('SELECT COUNT(*)::int AS count FROM users'),
        pool.query('SELECT COUNT(*)::int AS count FROM users WHERE is_active = true'),
        pool.query("SELECT COUNT(*)::int AS count FROM users WHERE created_at > NOW() - INTERVAL '30 days'"),
        pool.query('SELECT COUNT(*)::int AS count FROM skin_assessments'),
        pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 20'),
        pool.query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'),
        pool.query('SELECT status, COUNT(*)::int AS count FROM skincare_recommendations GROUP BY status'),
      ]);
      const recommendationCount = recommendationStatuses.rows.reduce((sum, row) => sum + integer(row.count), 0);
      const systemReports = [
        {
          title: 'Platform health',
          status: 'healthy',
          detail: `API healthy / database healthy with ${integer(assessments.rows[0].count)} recorded assessments.`
        },
        {
          title: 'User growth',
          status: 'positive',
          detail: `${integer(newUsers.rows[0].count)} new users in the last 30 days.`
        },
        {
          title: 'Recommendation pipeline',
          status: recommendationCount > 0 ? 'active' : 'idle',
          detail: `${recommendationCount} recommendations are tracked in the recommendation pipeline.`
        }
      ];

      return res.json({
        success: true,
        role,
        metrics: {
          totalUsers: integer(users.rows[0].count),
          activeUsers: integer(active.rows[0].count),
          newUsers: integer(newUsers.rows[0].count),
          assessments: integer(assessments.rows[0].count),
        },
        users: recentUsers.rows,
        roles: roles.rows,
        recommendationStatuses: recommendationStatuses.rows,
        recommendationCount,
        system: { api: 'healthy', database: 'healthy' },
        platform: {
          activeUsers: integer(active.rows[0].count),
          totalUsers: integer(users.rows[0].count),
          assessments: integer(assessments.rows[0].count),
          recommendationCount,
        },
        systemReports,
      });
    }

    if (role === 'consultant' || role === 'dermatologist') {
      const [people, reports, recent, clients, recommendationCount, conditionReports, progress] = await Promise.all([
        pool.query(
          `SELECT COUNT(DISTINCT u.id)::int AS count
           FROM users u JOIN care_team_shares s ON s.user_id = u.id
           WHERE u.role = 'user' AND u.is_active = true
             AND s.professional_id = $1 AND s.status = 'active'`,
          [userId]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM skin_assessments a
           JOIN care_team_shares s ON s.user_id = a.user_id
           WHERE s.professional_id = $1 AND s.status = 'active'`,
          [userId]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM skin_assessments a
           JOIN care_team_shares s ON s.user_id = a.user_id
           WHERE a.assessment_date > NOW() - INTERVAL '7 days'
             AND s.professional_id = $1 AND s.status = 'active'`,
          [userId]
        ),
        pool.query(
          `SELECT u.id, u.name, u.email, u.created_at,
                 COALESCE(a.skin_health_score, activity_score.skin_health_score) AS skin_health_score,
                 COALESCE(a.overall_condition, activity_score.overall_condition) AS overall_condition,
                 COALESCE(a.assessment_date, activity_score.assessment_date) AS assessment_date,
                 COALESCE(p.skin_type, activity_profile.skin_type) AS skin_type,
                 assessment_count.assessment_count
           FROM users u
           LEFT JOIN LATERAL (
             SELECT skin_health_score, overall_condition, assessment_date
             FROM skin_assessments WHERE user_id = u.id
             ORDER BY assessment_date DESC LIMIT 1
           ) a ON true
           LEFT JOIN skin_profiles p ON p.user_id = u.id
           LEFT JOIN LATERAL (
             SELECT
               NULLIF(activity_data->>'skin_health_score', '')::numeric AS skin_health_score,
               activity_data->>'overall_condition' AS overall_condition,
               created_at AS assessment_date
             FROM comprehensive_activity_log
             WHERE user_id = u.id AND activity_type = 'skin_assessment'
             ORDER BY created_at DESC LIMIT 1
           ) activity_score ON true
           LEFT JOIN LATERAL (
             SELECT activity_data->>'skin_type' AS skin_type
             FROM comprehensive_activity_log
             WHERE user_id = u.id AND activity_data ? 'skin_type'
             ORDER BY created_at DESC LIMIT 1
           ) activity_profile ON true
           LEFT JOIN LATERAL (
             SELECT COUNT(*)::int AS assessment_count
             FROM skin_assessments WHERE user_id = u.id
           ) assessment_count ON true
           JOIN care_team_shares s ON s.user_id = u.id
             AND s.professional_id = $1 AND s.status = 'active'
           WHERE u.role = 'user' AND u.is_active = true
           ORDER BY a.assessment_date DESC NULLS LAST, u.created_at DESC
           LIMIT 50`,
          [userId]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM skincare_recommendations r
           JOIN care_team_shares s ON s.user_id = r.user_id
           WHERE r.status = 'active' AND s.professional_id = $1 AND s.status = 'active'`,
          [userId]
        ),
        pool.query(
          `SELECT concern, COUNT(*)::int AS count
           FROM skin_assessments a
           JOIN care_team_shares s ON s.user_id = a.user_id
           CROSS JOIN LATERAL jsonb_array_elements_text(
             CASE WHEN jsonb_typeof(a.concerns) = 'array' THEN a.concerns ELSE '[]'::jsonb END
           ) AS concern
           WHERE s.professional_id = $1 AND s.status = 'active'
           GROUP BY concern ORDER BY count DESC LIMIT 10`
          , [userId]
        ),
        pool.query(
          `SELECT DATE(assessment_date) AS date,
                  ROUND(AVG(skin_health_score), 1)::float AS score,
                  COUNT(*)::int AS assessments
           FROM skin_assessments a
           JOIN care_team_shares s ON s.user_id = a.user_id
           WHERE a.assessment_date > NOW() - INTERVAL '90 days'
             AND s.professional_id = $1 AND s.status = 'active'
           GROUP BY DATE(assessment_date) ORDER BY date`
          , [userId]
        ),
      ]);
      return res.json({
        success: true,
        role,
        metrics: {
          activePeople: integer(people.rows[0].count),
          reports: integer(reports.rows[0].count),
          recentReports: integer(recent.rows[0].count),
          activeRecommendations: integer(recommendationCount.rows[0].count),
        },
        clients: clients.rows,
        conditionReports: conditionReports.rows,
        progress: progress.rows,
        summary: {
          recentAssessments: integer(recent.rows[0].count)
        }
      });
    }

    const [latest, history, checklist, checklistStats, trends, profile, recommendations, activity, comprehensiveActivity] = await Promise.all([
      pool.query(
        `SELECT skin_health_score, overall_condition, assessment_date
         FROM skin_assessments WHERE user_id = $1
         ORDER BY assessment_date DESC LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT skin_health_score, assessment_date
         FROM skin_assessments WHERE user_id = $1
         ORDER BY assessment_date DESC LIMIT 30`,
        [userId]
      ),
      pool.query(
        `SELECT task_id FROM skincare_checklist
         WHERE user_id = $1 AND completed_on = CURRENT_DATE
         ORDER BY completed_at`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS completed_tasks,
                COUNT(DISTINCT completed_on)::int AS active_days
         FROM skincare_checklist
         WHERE user_id = $1 AND completed_on >= CURRENT_DATE - INTERVAL '29 days'`,
        [userId]
      ),
      pool.query(
        `SELECT DATE_TRUNC('week', assessment_date)::date AS week,
                ROUND(AVG(skin_health_score), 1)::float AS average_score,
                COUNT(*)::int AS assessments
         FROM skin_assessments
         WHERE user_id = $1 AND assessment_date >= NOW() - INTERVAL '90 days'
         GROUP BY DATE_TRUNC('week', assessment_date)
         ORDER BY week`,
        [userId]
      ),
      pool.query(
        `SELECT skin_type, routine_morning, routine_evening
         FROM skin_profiles WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT r.id, r.title AS name, r.rationale AS reason, p.brand, p.product_name
         FROM skincare_recommendations r
         LEFT JOIN products p ON p.id = r.product_id
         WHERE r.user_id = $1 AND r.status = 'active'
         ORDER BY r.created_at DESC LIMIT 10`,
        [userId]
      ),
      pool.query(
        `SELECT method, path, status_code, created_at
         FROM user_activity_log
         WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT activity_type, activity_subtype, activity_data, created_at
         FROM comprehensive_activity_log
         WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 100`,
        [userId]
      ),
    ]);

    const firstAssessment = history.rows[history.rows.length - 1] || null;
    const latestAssessment = latest.rows[0] || null;
    const improvement = firstAssessment && latestAssessment
      ? Number(latestAssessment.skin_health_score) - Number(firstAssessment.skin_health_score)
      : null;
    const routineActivity = comprehensiveActivity.rows
      .filter((row) => row.activity_type === 'routine_completion' && row.activity_data);
    const routineActivityInWindow = routineActivity.filter((row) => {
      const createdAt = new Date(row.created_at);
      return createdAt >= new Date(Date.now() - (29 * 24 * 60 * 60 * 1000));
    });
    const activityCompletedTasks = routineActivityInWindow.reduce(
      (total, row) => total + Number(row.activity_data.steps_completed || 0),
      0
    );
    const activityActiveDays = new Set(
      routineActivityInWindow.map((row) => new Date(row.created_at).toISOString().slice(0, 10))
    ).size;
    const activityAdherence = routineActivityInWindow.length
      ? Math.round(routineActivityInWindow.reduce(
        (total, row) => total + Number(row.activity_data.completion_percentage || 0),
        0
      ) / routineActivityInWindow.length)
      : 0;
    const activityAssessments = comprehensiveActivity.rows
      .filter((row) => row.activity_type === 'skin_assessment' && row.activity_data)
      .map((row) => ({
        skin_health_score: Number(row.activity_data.skin_health_score ?? row.activity_data.score),
        assessment_date: row.created_at,
      }))
      .filter((row) => Number.isFinite(row.skin_health_score));
    const effectiveHistory = history.rows.length ? history.rows : activityAssessments;
    const effectiveLatest = latestAssessment || effectiveHistory[0] || null;
    const effectiveFirst = firstAssessment || effectiveHistory[effectiveHistory.length - 1] || null;
    const effectiveImprovement = effectiveFirst && effectiveLatest
      ? Number(effectiveLatest.skin_health_score) - Number(effectiveFirst.skin_health_score)
      : null;
    const adherence = checklistStats.rows.length && Number(checklistStats.rows[0].completed_tasks) > 0
      ? Math.round((Number(checklistStats.rows[0].completed_tasks) / (TASK_IDS.length * 30)) * 100)
      : activityAdherence;

    return res.json({
      success: true,
      role,
      skinHealth: effectiveLatest,
      history: effectiveHistory,
      checklist: checklist.rows.map((row) => row.task_id).filter((taskId) => TASK_IDS.includes(taskId)),
      taskCount: TASK_IDS.length,
      profile: profile.rows[0] || null,
      recommendations: recommendations.rows,
      activity: activity.rows,
      analytics: {
        adherence: {
          completedTasks: checklistStats.rows.length && Number(checklistStats.rows[0].completed_tasks) > 0
            ? integer(checklistStats.rows[0].completed_tasks)
            : activityCompletedTasks,
          activeDays: checklistStats.rows.length && Number(checklistStats.rows[0].active_days) > 0
            ? integer(checklistStats.rows[0].active_days)
            : activityActiveDays,
          rate: Math.min(100, adherence),
          windowDays: 30,
        },
        improvement: effectiveImprovement === null ? null : Number(effectiveImprovement.toFixed(1)),
        beforeAfter: effectiveFirst && effectiveLatest ? {
          before: { score: effectiveFirst.skin_health_score, date: effectiveFirst.assessment_date },
          after: { score: effectiveLatest.skin_health_score, date: effectiveLatest.assessment_date },
        } : null,
        trends: trends.rows.length ? trends.rows : activityAssessments.map((assessment) => ({
          week: assessment.assessment_date,
          average_score: assessment.skin_health_score,
          assessments: 1,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT method, path, status_code, created_at
       FROM user_activity_log
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 200`,
      [req.user.id]
    );
    return res.json({ success: true, history: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/sharing', authMiddleware, async (req, res, next) => {
  try {
    const query = req.user.role === 'user'
      ? `SELECT s.id, s.access_level, s.status, s.granted_at,
                p.id AS professional_id, p.name, p.email, p.role
         FROM care_team_shares s JOIN users p ON p.id = s.professional_id
         WHERE s.user_id = $1 ORDER BY s.granted_at DESC`
      : `SELECT s.id, s.access_level, s.status, s.granted_at,
                u.id AS user_id, u.name, u.email
         FROM care_team_shares s JOIN users u ON u.id = s.user_id
         WHERE s.professional_id = $1 AND s.status = 'active'
         ORDER BY s.granted_at DESC`;
    const result = await pool.query(query, [req.user.id]);
    return res.json({ success: true, shares: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/sharing/professionals', authMiddleware, requireRole('user'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, role
       FROM users
       WHERE role IN ('consultant', 'dermatologist')
         AND is_active = true
         AND id <> $1
       ORDER BY role, name`,
      [req.user.id]
    );
    return res.json({ success: true, professionals: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/shared-report/:userId', authMiddleware, requireRole('consultant', 'dermatologist'), async (req, res, next) => {
  try {
    const access = await pool.query(
      `SELECT 1 FROM care_team_shares
       WHERE user_id = $1 AND professional_id = $2 AND status = 'active'`,
      [req.params.userId, req.user.id]
    );
    if (!access.rows.length) {
      return res.status(403).json({ success: false, message: 'This user has not shared their records with you.' });
    }

    const [user, profile, assessments, recommendations, checklist, activity, comprehensiveActivity, routineTracking] = await Promise.all([
      pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1 AND role = $2 AND is_active = true',
        [req.params.userId, 'user']
      ),
      pool.query(
        `SELECT skin_type, skin_concerns, allergies,
                routine_morning, routine_evening, updated_at
         FROM skin_profiles WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT id, skin_health_score, overall_condition, concerns,
                risk_factors, notes, assessment_date
         FROM skin_assessments WHERE user_id = $1
         ORDER BY assessment_date DESC LIMIT 30`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT r.id, r.title, r.rationale, r.status, r.created_at,
                p.brand, p.product_name
         FROM skincare_recommendations r
         LEFT JOIN products p ON p.id = r.product_id
         WHERE r.user_id = $1 AND r.status = 'active'
         ORDER BY r.created_at DESC`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT task_id, completed_on, completed_at
         FROM skincare_checklist
         WHERE user_id = $1
         ORDER BY completed_at DESC LIMIT 100`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT method, path, status_code, created_at
         FROM user_activity_log
         WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 100`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT activity_type, activity_subtype, activity_data, source_page, 
                created_at, success
         FROM comprehensive_activity_log
         WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT routine_type, routine_name, completion_status, 
                completion_percentage, performed_date, steps, created_at
         FROM routine_tracking
         WHERE user_id = $1
         ORDER BY performed_date DESC, created_at DESC LIMIT 30`,
        [req.params.userId]
      )
    ]);
    if (!user.rows.length) return res.status(404).json({ success: false, message: 'Shared user not found.' });
    return res.json({
      success: true,
      user: user.rows[0],
      profile: profile.rows[0] || null,
      assessments: assessments.rows,
      recommendations: recommendations.rows,
      checklist: checklist.rows,
      activity: activity.rows,
      comprehensiveActivity: comprehensiveActivity.rows,
      routineTracking: routineTracking.rows,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/sharing', authMiddleware, requireRole('user'), async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const requestedRole = req.body.role;
    const professionalId = typeof req.body.professionalId === 'string' ? req.body.professionalId : '';
    if (!professionalId && (!email || !['consultant', 'dermatologist'].includes(requestedRole))) {
      return res.status(400).json({ success: false, message: 'Professional email and role are required.' });
    }
    const professional = professionalId
      ? await pool.query(
        `SELECT id, name, email, role FROM users
         WHERE id = $1 AND role IN ('consultant', 'dermatologist') AND is_active = true`,
        [professionalId]
      )
      : await pool.query(
        'SELECT id, name, email, role FROM users WHERE email = $1 AND role = $2 AND is_active = true',
        [email, requestedRole]
      );
    if (!professional.rows.length) {
      return res.status(404).json({ success: false, message: 'No active professional matches that email.' });
    }
    const result = await pool.query(
      `INSERT INTO care_team_shares (user_id, professional_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, professional_id)
       DO UPDATE SET status = 'active', revoked_at = NULL, granted_at = NOW()
       RETURNING id, access_level, status, granted_at`,
      [req.user.id, professional.rows[0].id]
    );
    return res.status(201).json({ success: true, share: { ...result.rows[0], professional: professional.rows[0] } });
  } catch (error) {
    return next(error);
  }
});

router.delete('/sharing/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE care_team_shares SET status = 'revoked', revoked_at = NOW()
       WHERE id = $1 AND (user_id = $2 OR professional_id = $2)
       RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Share permission not found.' });
    return res.json({ success: true, message: 'Access revoked.' });
  } catch (error) {
    return next(error);
  }
});

router.put('/checklist', authMiddleware, requireRole('user'), async (req, res, next) => {
  try {
    const taskId = typeof req.body.taskId === 'string' ? req.body.taskId : '';
    const completed = req.body.completed === true;
    if (!TASK_IDS.includes(taskId)) {
      return res.status(400).json({ success: false, message: 'Unknown checklist task.' });
    }

    if (completed) {
      await pool.query(
        `INSERT INTO skincare_checklist (user_id, task_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, task_id, completed_on) DO NOTHING`,
        [req.user.id, taskId]
      );
    } else {
      await pool.query(
        'DELETE FROM skincare_checklist WHERE user_id = $1 AND task_id = $2 AND completed_on = CURRENT_DATE',
        [req.user.id, taskId]
      );
    }

    const result = await pool.query(
      'SELECT task_id FROM skincare_checklist WHERE user_id = $1 AND completed_on = CURRENT_DATE ORDER BY completed_at',
      [req.user.id]
    );
    return res.json({ success: true, checklist: result.rows.map((row) => row.task_id) });
  } catch (error) {
    return next(error);
  }
});

router.post('/recommendations', authMiddleware, requireRole('consultant', 'dermatologist'), async (req, res, next) => {
  try {
    const { userId, title, rationale, productId } = req.body;
    if (typeof userId !== 'string' || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'userId and title are required.' });
    }
    const result = await pool.query(
      `INSERT INTO skincare_recommendations (user_id, created_by, product_id, title, rationale)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, product_id, title AS name, rationale AS reason, status, created_at`,
      [userId, req.user.id, productId || null, title.trim(), typeof rationale === 'string' ? rationale.trim() : null]
    );
    return res.status(201).json({ success: true, recommendation: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.patch('/recommendations/:id', authMiddleware, requireRole('consultant', 'dermatologist'), async (req, res, next) => {
  try {
    const status = ['active', 'archived', 'approved'].includes(req.body.status) ? req.body.status : null;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Invalid recommendation status.' });
    }
    const result = await pool.query(
      `UPDATE skincare_recommendations SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, user_id, title AS name, rationale AS reason, status`,
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Recommendation not found.' });
    return res.json({ success: true, recommendation: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
