const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authMiddleware, requireRole } = require('../middleware/auth');

const REPORT_EXPORT_TYPES = [
  'skin_assessment',
  'routine',
  'product_recommendation',
  'progress',
  'skin_health',
  'comprehensive'
];

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

const REPORT_TYPE_LABELS = {
  comprehensive: 'Comprehensive Report',
  skin_assessment: 'Skin Assessment Report',
  routine: 'Routine Report',
  product_recommendation: 'Product Recommendation Report',
  progress: 'Progress Report',
  skin_health: 'Skin Health Report'
};

function getReportSummaryLines(reportData, reportType) {
  const data = reportData || {};
  const userName = data.user?.name || 'Unknown user';
  const userEmail = data.user?.email || 'N/A';
  const latest = data.latestAssessment || {};
  const assessments = data.assessments?.history || [];
  const recommendations = data.recommendations || { skincare: [], ai: [] };
  const routines = data.routines || {};
  const stats = data.statistics || {};

  const summary = [
    `${REPORT_TYPE_LABELS[reportType] || 'Report'}: ${userName}`,
    `Generated: ${new Date(data.generatedAt || Date.now()).toLocaleString()}`,
    `User Email: ${userEmail}`,
    `Latest Skin Score: ${latest.skin_health_score ?? stats.latestScore ?? 'N/A'}`,
    `Average Score: ${data.assessments?.averageScore ?? stats.averageScore ?? 'N/A'}`,
    `Total Assessments: ${assessments.length || stats.totalAssessments || 0}`,
    `Active Recommendations: ${(recommendations.skincare || []).length + (recommendations.ai || []).length || stats.totalRecommendations || 0}`,
    `Routine Adherence: ${routines.adherence ?? stats.routineAdherence ?? 0}%`,
    `Most Common Concern: ${data.statistics?.mostCommonConcerns?.[0]?.concern || 'N/A'}`
  ];

  if (Array.isArray(assessments) && assessments.length) {
    assessments.slice(0, 5).forEach((item, index) => {
      summary.push(`Assessment ${index + 1}: ${item.assessment_date || 'N/A'} | Score ${item.skin_health_score ?? 'N/A'} | Condition ${item.overall_condition || 'N/A'}`);
    });
  }

  if (Array.isArray(recommendations.skincare) && recommendations.skincare.length) {
    recommendations.skincare.slice(0, 3).forEach((item, index) => {
      summary.push(`Recommendation ${index + 1}: ${item.title || 'Product'} | ${item.status || 'active'}`);
    });
  }

  return summary;
}

function escapePdfText(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdfExport(reportData, reportType) {
  const lines = getReportSummaryLines(reportData, reportType);
  const objects = [];
  let content = '';

  lines.forEach((line, index) => {
    const y = 760 - (index * 16);
    content += `BT /F1 11 Tf 72 ${y} Td (${escapePdfText(line)}) Tj ET\n`;
  });

  const contentLength = Buffer.byteLength(content, 'utf8');

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');
  objects.push(`4 0 obj\n<< /Length ${contentLength} >>\nstream\n${content}endstream\nendobj\n`);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

function buildExcelExport(reportData, reportType) {
  const rows = getReportSummaryLines(reportData, reportType);
  const xmlRows = rows.map((line) => `<Row><Cell><Data ss:Type="String">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell></Row>`).join('');

  const workbookXml = `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:html="http://www.w3.org/TR/REC-html40">
    <Worksheet ss:Name="${(REPORT_TYPE_LABELS[reportType] || 'Report').replace(/&/g, '&amp;')}">
      <Table>
        ${xmlRows}
      </Table>
    </Worksheet>
  </Workbook>`;

  return Buffer.from(workbookXml, 'utf8');
}

// Helper function to generate comprehensive user report
async function generateComprehensiveReport(userId, reportType = 'comprehensive') {
  try {
    // Fetch all user data in parallel
    const [
      user,
      profile,
      assessments,
      lifestyle,
      sleep,
      hydration,
      environment,
      recommendations,
      aiRecommendations,
      routineTracking,
      comprehensiveActivity,
      latestAssessment
    ] = await Promise.all([
      pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]),
      pool.query(
        `SELECT skin_type, skin_concerns, allergies, sensitivity_level,
               products_used, routine_morning, routine_evening, updated_at
         FROM skin_profiles WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT id, skin_health_score, overall_condition, concerns, risk_factors,
                 notes, assessment_date
         FROM skin_assessments WHERE user_id = $1
         ORDER BY assessment_date DESC LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT diet_type, water_intake_daily, exercise_frequency, stress_level,
                smoking_status, alcohol_consumption, notes, recorded_date
         FROM lifestyle_tracking WHERE user_id = $1
         ORDER BY recorded_date DESC LIMIT 30`,
        [userId]
      ),
      pool.query(
        `SELECT sleep_date, bedtime, wake_time, sleep_duration, sleep_quality,
                disturbances, notes
         FROM sleep_tracking WHERE user_id = $1
         ORDER BY sleep_date DESC LIMIT 30`,
        [userId]
      ),
      pool.query(
        `SELECT tracking_date, target_intake, current_intake, intake_logs,
                goal_achieved, notes
         FROM hydration_tracking WHERE user_id = $1
         ORDER BY tracking_date DESC LIMIT 30`,
        [userId]
      ),
      pool.query(
        `SELECT exposure_date, uv_index, sun_exposure_hours, pollution_level,
                humidity_level, temperature_avg, indoor_air_quality, sunscreen_applied,
                sunscreen_spf, notes
         FROM environmental_exposure WHERE user_id = $1
         ORDER BY exposure_date DESC LIMIT 30`,
        [userId]
      ),
      pool.query(
        `SELECT r.id, r.title, r.rationale, r.status, r.created_at, r.updated_at,
                p.brand, p.product_name, p.price_tier, p.current_price
         FROM skincare_recommendations r
         LEFT JOIN products p ON p.id = r.product_id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT id, recommendation_type, input_data, ai_response, confidence_score,
                applied, feedback, created_at
         FROM ai_recommendations WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT id, routine_type, routine_name, steps, completion_status,
                completion_percentage, duration_minutes, notes, performed_date
         FROM routine_tracking WHERE user_id = $1
         ORDER BY performed_date DESC LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT activity_type, activity_subtype, activity_data, source_page,
                api_endpoint, method, status_code, success, created_at
         FROM comprehensive_activity_log WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 100`,
        [userId]
      ),
      pool.query(
        `SELECT skin_health_score, overall_condition, concerns, risk_factors,
                 assessment_date
         FROM skin_assessments WHERE user_id = $1
         ORDER BY assessment_date DESC LIMIT 1`,
        [userId]
      )
    ]);

    // Calculate statistics and trends
    const scoreHistory = assessments.rows.map(a => ({
      date: a.assessment_date,
      score: a.skin_health_score,
      condition: a.overall_condition
    }));

    // Older clients may have assessment and recommendation data only in the
    // activity log. Use it when normalized tables are empty.
    const activityAssessments = comprehensiveActivity.rows
      .filter(item => item.activity_type === 'skin_assessment' && item.activity_data)
      .map(item => ({
        skin_health_score: item.activity_data.skin_health_score ?? item.activity_data.score ?? null,
        overall_condition: item.activity_data.overall_condition ?? item.activity_data.condition ?? null,
        concerns: Array.isArray(item.activity_data.concerns) ? item.activity_data.concerns : [],
        assessment_date: item.created_at
      }))
      .filter(item => item.skin_health_score !== null);
    const reportAssessments = assessments.rows.length ? assessments.rows : activityAssessments;
    const activityRecommendations = comprehensiveActivity.rows
      .filter(item => item.activity_type === 'ai_recommendation' && item.activity_data)
      .map(item => ({
        title: item.activity_subtype === 'product_recommendation'
          ? 'AI product recommendation'
          : 'AI ingredient analysis',
        rationale: item.activity_data.ingredient
          ? `${item.activity_data.ingredient} suitability score: ${item.activity_data.suitability_score ?? 'not scored'}`
          : `${item.activity_data.recommendation_count ?? 0} product recommendations generated`,
        recommendation_type: item.activity_subtype,
        created_at: item.created_at,
        details: item.activity_data
      }));
    const reportScoreHistory = reportAssessments.map(a => ({
      date: a.assessment_date,
      score: a.skin_health_score,
      condition: a.overall_condition
    }));

    const scoreTrend = reportScoreHistory.length > 1
      ? (reportScoreHistory[0].score - reportScoreHistory[reportScoreHistory.length - 1].score)
      : 0;

    const concernFrequency = {};
    reportAssessments.forEach(a => {
      if (a.concerns && Array.isArray(a.concerns)) {
        a.concerns.forEach(concern => {
          concernFrequency[concern] = (concernFrequency[concern] || 0) + 1;
        });
      }
    });

    const routineAdherence = routineTracking.rows.length > 0
      ? Math.round(
          routineTracking.rows.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / 
          routineTracking.rows.length
        )
      : 0;

    // Build comprehensive report data
    const reportData = {
      reportType,
      generatedAt: new Date().toISOString(),
      user: user.rows[0] || null,
      profile: profile.rows[0] || null,
      latestAssessment: latestAssessment.rows[0] || reportAssessments[0] || null,
      assessments: {
        history: reportAssessments,
        count: reportAssessments.length,
        scoreHistory: reportScoreHistory,
        scoreTrend,
        concernFrequency,
        averageScore: reportAssessments.length > 0
          ? Math.round(reportAssessments.reduce((sum, a) => sum + Number(a.skin_health_score), 0) / reportAssessments.length)
          : null
      },
      lifestyle: lifestyle.rows,
      sleep: sleep.rows,
      hydration: hydration.rows,
      environment: environment.rows,
      recommendations: {
        skincare: recommendations.rows,
        ai: aiRecommendations.rows.length ? aiRecommendations.rows : activityRecommendations,
        total: recommendations.rows.length + (aiRecommendations.rows.length || activityRecommendations.length)
      },
      routines: {
        tracking: routineTracking.rows,
        adherence: routineAdherence,
        totalCompletions: routineTracking.rows.filter(r => r.completion_status === 'completed').length
      },
      activity: {
        comprehensive: comprehensiveActivity.rows,
        totalActivities: comprehensiveActivity.rows.length,
        activitySummary: comprehensiveActivity.rows.reduce((summary, activity) => {
          summary[activity.activity_type] = (summary[activity.activity_type] || 0) + 1;
          return summary;
        }, {})
      },
      statistics: {
        totalAssessments: reportAssessments.length,
        totalRecommendations: recommendations.rows.length + (aiRecommendations.rows.length || activityRecommendations.length),
        totalRoutines: routineTracking.rows.length,
        routineAdherence,
        latestScore: reportAssessments[0]?.skin_health_score ?? null,
        scoreTrend,
        mostCommonConcerns: Object.entries(concernFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([concern, count]) => ({ concern, count }))
      }
    };

    return reportData;
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    throw error;
  }
}

// POST /api/reports/generate - Generate comprehensive report
router.post('/generate', authMiddleware, async (req, res, next) => {
  try {
    const { reportType = 'comprehensive', reportPeriodStart, reportPeriodEnd, generatedFor = 'user' } = req.body;
    
    // Generate comprehensive report data
    const reportData = await generateComprehensiveReport(req.user.id, reportType);
    
    // Save report to database
    const result = await pool.query(
      `INSERT INTO user_reports 
       (user_id, report_type, report_data, report_period_start, report_period_end, 
        generated_for, generated_by, is_shared, shared_with, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
       RETURNING *`,
      [
        req.user.id,
        reportType,
        JSON.stringify(reportData),
        reportPeriodStart || null,
        reportPeriodEnd || null,
        generatedFor,
        req.user.id,
        false,
        []
      ]
    );
    
    // Log report generation activity
    await pool.query(
      `INSERT INTO comprehensive_activity_log 
       (user_id, activity_type, activity_subtype, activity_data, source_page, success)
       VALUES ($1, 'report_generation', $2, $3, $4, $5)`,
      [
        req.user.id,
        reportType,
        JSON.stringify({ reportId: result.rows[0].id, reportType }),
        'user_dashboard',
        true
      ]
    );
    
    return res.json({
      success: true,
      report: result.rows[0],
      reportData
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/reports/types - Get available report export types
router.get('/types', authMiddleware, async (req, res, next) => {
  try {
    console.log('reports/types hit', req.user?.id, req.user?.role);
    return res.json({
      success: true,
      types: [
        { value: 'skin_assessment', label: 'Skin Assessment Report' },
        { value: 'routine', label: 'Routine Report' },
        { value: 'product_recommendation', label: 'Product Recommendation Report' },
        { value: 'progress', label: 'Progress Report' },
        { value: 'skin_health', label: 'Skin Health Report' },
        { value: 'comprehensive', label: 'Comprehensive Report' }
      ]
    });
  } catch (error) {
    console.error('reports/types error', error);
    return next(error);
  }
});

// GET /api/reports - Get user's reports
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { reportType, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT id, report_type, report_data, report_period_start, report_period_end,
             generated_for, generated_by, is_shared, shared_with, version, created_at
      FROM user_reports
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    
    if (reportType) {
      query += ` AND report_type = $${params.length + 1}`;
      params.push(reportType);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM user_reports WHERE user_id = $1`,
      [req.user.id]
    );
    
    return res.json({
      success: true,
      reports: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: parseInt(countResult.rows[0].total)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/reports/export - Export report as PDF or Excel
router.post('/export', authMiddleware, async (req, res, next) => {
  try {
    const { reportType = 'skin_assessment', format = 'pdf', userId } = req.body || {};
    const targetUserId = userId || req.user.id;
    const normalizedFormat = String(format).toLowerCase();

    if (!REPORT_EXPORT_TYPES.includes(reportType)) {
      return res.status(400).json({ success: false, message: 'Invalid report type.' });
    }
    if (!['pdf', 'excel', 'xls'].includes(normalizedFormat)) {
      return res.status(400).json({ success: false, message: 'Format must be pdf or excel.' });
    }

    if (targetUserId !== req.user.id && !['admin', 'consultant', 'dermatologist'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this report.' });
    }

    if (targetUserId !== req.user.id && ['consultant', 'dermatologist'].includes(req.user.role)) {
      const accessCheck = await pool.query(
        `SELECT 1
         FROM care_team_shares
         WHERE user_id = $1 AND professional_id = $2 AND status = 'active'`,
        [targetUserId, req.user.id]
      );

      if (!accessCheck.rows.length) {
        return res.status(403).json({ success: false, message: 'This user has not shared their reports with you.' });
      }
    }

    const reportData = await generateComprehensiveReport(targetUserId, reportType);
    const buffer = normalizedFormat === 'pdf'
      ? buildPdfExport(reportData, reportType)
      : buildExcelExport(reportData, reportType);

    const fileExtension = normalizedFormat === 'pdf' ? 'pdf' : 'xls';
    const fileName = `${(reportType || 'report').replace(/_/g, '-')}.${fileExtension}`;

    res.setHeader('Content-Type', normalizedFormat === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  } catch (error) {
    return next(error);
  }
});

// GET /api/reports/patient/:userId - Get a shared patient's comprehensive report
router.get('/patient/:userId', authMiddleware, requireRole('consultant', 'dermatologist'), async (req, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient user id format.'
      });
    }

    const access = await pool.query(
      `SELECT 1
       FROM care_team_shares
       WHERE user_id = $1 AND professional_id = $2 AND status = 'active'`,
      [req.params.userId, req.user.id]
    );

    if (!access.rows.length) {
      return res.status(403).json({
        success: false,
        message: 'This patient has not shared their reports with you'
      });
    }

    const [user, profile, assessments, recommendations, routines, activity] = await Promise.all([
      pool.query(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1 AND role = 'user' AND is_active = true`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT skin_type, skin_concerns, allergies,
                routine_morning, routine_evening, updated_at
         FROM skin_profiles
         WHERE user_id = $1
         ORDER BY updated_at DESC
         LIMIT 1`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT id, skin_health_score, overall_condition, concerns,
                risk_factors, notes, assessment_date
         FROM skin_assessments
         WHERE user_id = $1
         ORDER BY assessment_date DESC
         LIMIT 30`,
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
        `SELECT routine_type, routine_name, completion_status,
                completion_percentage, performed_date, steps, created_at
         FROM routine_tracking
         WHERE user_id = $1
         ORDER BY performed_date DESC, created_at DESC
         LIMIT 30`,
        [req.params.userId]
      ),
      pool.query(
        `SELECT activity_type, activity_subtype, activity_data, source_page,
                created_at, success
         FROM comprehensive_activity_log
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [req.params.userId]
      )
    ]);

    if (!user.rows.length) {
      return res.status(404).json({ success: false, message: 'Shared user not found.' });
    }

    const history = assessments.rows;
    const activityAssessments = activity.rows
      .filter(item => item.activity_type === 'skin_assessment' && item.activity_data)
      .map(item => {
        const data = item.activity_data;
        return {
          skin_health_score: data.skin_health_score ?? data.score ?? null,
          overall_condition: data.overall_condition ?? data.condition ?? null,
          concerns: Array.isArray(data.concerns) ? data.concerns : [],
          assessment_date: item.created_at
        };
      })
      .filter(item => item.skin_health_score !== null);
    const reportHistory = history.length ? history : activityAssessments;
    const activityRecommendations = activity.rows
      .filter(item => item.activity_type === 'ai_recommendation' && item.activity_data)
      .map(item => ({
        title: item.activity_subtype === 'product_recommendation'
          ? 'AI product recommendation'
          : 'AI ingredient analysis',
        rationale: item.activity_data.ingredient
          ? `${item.activity_data.ingredient} suitability score: ${item.activity_data.suitability_score ?? 'not scored'}`
          : `${item.activity_data.recommendation_count ?? 0} product recommendations generated`,
        recommendationType: item.activity_subtype,
        created_at: item.created_at,
        details: item.activity_data
      }));
    const activityRoutineEntries = activity.rows
      .filter(item => item.activity_type === 'routine_completion' && item.activity_data);
    const latestRoutineActivity = activityRoutineEntries[0]?.activity_data;
    let profileData = profile.rows[0] || null;
    if (profileData?.skin_type == null) {
      const activitySkinType = activity.rows.find(item => item.activity_data?.skin_type)?.activity_data?.skin_type;
      if (activitySkinType) {
        profileData = { ...profileData, skin_type: activitySkinType };
      }
    }
    const averageScore = reportHistory.length
      ? Math.round(reportHistory.reduce((sum, item) => sum + (item.skin_health_score || 0), 0) / reportHistory.length)
      : null;
    const latest = reportHistory[0] || null;
    const adherence = routines.rows.length
      ? Math.round(routines.rows.reduce((sum, item) => sum + (item.completion_percentage || 0), 0) / routines.rows.length)
      : 0;
    const activitySummary = activity.rows.reduce((summary, item) => {
      summary[item.activity_type] = (summary[item.activity_type] || 0) + 1;
      return summary;
    }, {});
    const reportData = {
      reportType: 'clinical',
      generatedAt: new Date().toISOString(),
      user: user.rows[0],
      profile: profileData,
      latestAssessment: latest,
      assessments: {
        history: reportHistory,
        count: reportHistory.length,
        averageScore,
        latestScore: reportHistory[0]?.skin_health_score || null,
        scoreTrend: reportHistory.length > 1 ? reportHistory[0].skin_health_score - reportHistory[reportHistory.length - 1].skin_health_score : 0,
        mostCommonConcerns: []
      },
      recommendations: {
        skincare: recommendations.rows,
        ai: activityRecommendations,
        total: recommendations.rows.length + activityRecommendations.length
      },
      routines: {
        tracking: routines.rows,
        adherence: routines.rows.length ? adherence : (latestRoutineActivity?.completion_percentage ?? 0),
        totalCompletions: routines.rows.filter(item => item.completion_status === 'completed').length
      },
      activity: {
        comprehensive: activity.rows,
        totalActivities: activity.rows.length,
        activitySummary
      },
      statistics: {
        totalAssessments: reportHistory.length,
        totalRecommendations: recommendations.rows.length + activityRecommendations.length,
        totalRoutines: routines.rows.length,
        routineAdherence: routines.rows.length ? adherence : (latestRoutineActivity?.completion_percentage ?? 0),
        latestScore: reportHistory[0]?.skin_health_score || null
      }
    };
    return res.json({ success: true, report: reportData });
  } catch (error) {
    return next(error);
  }
});

// GET /api/reports/shared/:reportId - Get shared report (for professionals)
// Must come before /:id to avoid route matching conflicts
router.get('/shared/:reportId', authMiddleware, async (req, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.reportId)) {
      return res.status(400).json({
       success: false,
       message: 'Invalid shared report id format.'
      });
    }

    const report = await pool.query(
      `SELECT * FROM user_reports 
       WHERE id = $1 AND is_shared = true AND $2 = ANY(shared_with)`,
      [req.params.reportId, req.user.id]
    );
    
    if (!report.rows.length) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to this report' 
      });
    }
    
    // Log report view activity
    await pool.query(
      `INSERT INTO comprehensive_activity_log 
       (user_id, activity_type, activity_subtype, activity_data, success)
       VALUES ($1, 'report_view', 'shared_report', $2, $3)`,
      [
        req.user.id,
        JSON.stringify({ reportId: req.params.reportId, accessType: 'shared' }),
        true
      ]
    );
    
    return res.json({
      success: true,
      report: report.rows[0]
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/reports/:id - Get specific report
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(400).json({
       success: false,
       message: 'Invalid report id format.'
      });
    }

    const result = await pool.query(
      `SELECT * FROM user_reports 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (!result.rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    const activityResult = await pool.query(
      `SELECT activity_type, activity_subtype, activity_data, created_at
       FROM comprehensive_activity_log
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    const report = result.rows[0];
    const reportData = report.report_data || {};
    const activityRows = activityResult.rows;
    const aiRecommendations = activityRows
      .filter(item => item.activity_type === 'ai_recommendation' && item.activity_data)
      .map(item => ({
        title: item.activity_subtype === 'product_recommendation'
          ? 'AI product recommendation'
          : 'AI ingredient analysis',
        rationale: item.activity_data.ingredient
          ? `${item.activity_data.ingredient} suitability score: ${item.activity_data.suitability_score ?? 'not scored'}`
          : `${item.activity_data.recommendation_count ?? 0} product recommendations generated`,
        recommendationType: item.activity_subtype,
        created_at: item.created_at,
        details: item.activity_data
      }));
    const activitySkinType = activityRows.find(item => item.activity_data?.skin_type)?.activity_data?.skin_type;
    report.report_data = {
      ...reportData,
      profile: reportData.profile || activitySkinType ? {
        ...(reportData.profile || {}),
        ...(activitySkinType && !reportData.profile?.skin_type ? { skin_type: activitySkinType } : {})
      } : null,
      recommendations: {
        ...(reportData.recommendations || {}),
        ai: reportData.recommendations?.ai?.length ? reportData.recommendations.ai : aiRecommendations,
        total: (reportData.recommendations?.skincare?.length || 0) + aiRecommendations.length
      },
      activity: {
        ...(reportData.activity || {}),
        comprehensive: activityRows,
        totalActivities: activityRows.length,
        activitySummary: activityRows.reduce((summary, item) => {
          summary[item.activity_type] = (summary[item.activity_type] || 0) + 1;
          return summary;
        }, {})
      }
    };
    
    // Log report view activity
    await pool.query(
      `INSERT INTO comprehensive_activity_log 
       (user_id, activity_type, activity_subtype, activity_data, success)
       VALUES ($1, 'report_view', $2, $3, $4)`,
      [
        req.user.id,
        result.rows[0].report_type,
        JSON.stringify({ reportId: req.params.id }),
        true
      ]
    );
    
    return res.json({
      success: true,
      report
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/reports/:id/share - Share report with professionals
router.put('/:id/share', authMiddleware, async (req, res, next) => {
  try {
    const { professionalIds = [] } = req.body;
    
    if (!Array.isArray(professionalIds) || professionalIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'professionalIds array is required' 
      });
    }
    
    // Verify professionals exist and have appropriate roles
    const professionals = await pool.query(
      `SELECT id, name, email, role FROM users
       WHERE id = ANY($1) AND role IN ('consultant', 'dermatologist') AND is_active = true`,
      [professionalIds]
    );
    
    if (professionals.rows.length !== professionalIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some professional IDs are invalid or users are not active professionals' 
      });
    }
    
    // Update report sharing
    const result = await pool.query(
      `UPDATE user_reports 
       SET is_shared = true, shared_with = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [professionalIds, req.params.id, req.user.id]
    );
    
    if (!result.rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    // Log sharing activity
    await pool.query(
      `INSERT INTO comprehensive_activity_log 
       (user_id, activity_type, activity_subtype, activity_data, success)
       VALUES ($1, 'report_sharing', $2, $3, $4)`,
      [
        req.user.id,
        'share_with_professionals',
        JSON.stringify({ 
          reportId: req.params.id, 
          sharedWith: professionals.rows.map(p => ({ id: p.id, name: p.name, role: p.role }))
        }),
        true
      ]
    );
    
    return res.json({
      success: true,
      report: result.rows[0],
      sharedWith: professionals.rows
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/reports/:id - Delete report
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM user_reports 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    
    if (!result.rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    return res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;