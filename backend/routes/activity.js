const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Helper function to log comprehensive activity
async function logActivity(userId, activityType, activityData, options = {}) {
  try {
    const {
      activitySubtype,
      sourcePage,
      apiEndpoint,
      method,
      statusCode,
      success = true,
      errorMessage,
      sessionId,
      ipAddress,
      userAgent
    } = options;

    await pool.query(
      `INSERT INTO comprehensive_activity_log 
       (user_id, activity_type, activity_subtype, activity_data, source_page, 
        api_endpoint, method, status_code, success, error_message, session_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        userId,
        activityType,
        activitySubtype || null,
        activityData ? JSON.stringify(activityData) : null,
        sourcePage || null,
        apiEndpoint || null,
        method || null,
        statusCode || null,
        success,
        errorMessage || null,
        sessionId || null,
        ipAddress || null,
        userAgent || null
      ]
    );
  } catch (error) {
    console.error('Failed to log activity:', error.message);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

// GET /api/activity/history - Get user's comprehensive activity history
router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, activityType } = req.query;
    
    let query = `
      SELECT id, activity_type, activity_subtype, activity_data, source_page, 
             api_endpoint, method, status_code, success, error_message, created_at
      FROM comprehensive_activity_log
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    
    if (activityType) {
      query += ` AND activity_type = $${params.length + 1}`;
      params.push(activityType);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    // Get activity counts by type
    const countsResult = await pool.query(
      `SELECT activity_type, COUNT(*) as count
       FROM comprehensive_activity_log
       WHERE user_id = $1
       GROUP BY activity_type
       ORDER BY count DESC`,
      [req.user.id]
    );
    
    return res.json({
      success: true,
      activities: result.rows,
      activityCounts: countsResult.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/activity/summary - Get activity summary for dashboard
router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get recent activity counts
    const recentActivity = await pool.query(
      `SELECT 
         activity_type,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_count,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month_count,
         COUNT(*) as total_count
       FROM comprehensive_activity_log
       WHERE user_id = $1
       GROUP BY activity_type
       ORDER BY total_count DESC`,
      [userId]
    );
    
    // Get latest activities by type
    const latestActivities = await pool.query(
      `SELECT DISTINCT ON (activity_type) 
         activity_type, activity_subtype, activity_data, created_at
       FROM comprehensive_activity_log
       WHERE user_id = $1
       ORDER BY activity_type, created_at DESC
       LIMIT 10`,
      [userId]
    );
    
    return res.json({
      success: true,
      recentActivity: recentActivity.rows,
      latestActivities: latestActivities.rows
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/activity/log - Manual activity logging (for frontend operations)
router.post('/log', authMiddleware, async (req, res, next) => {
  try {
    const { activityType, activitySubtype, activityData, sourcePage } = req.body;
    
    if (!activityType) {
      return res.status(400).json({ success: false, message: 'activityType is required' });
    }
    
    await logActivity(
      req.user.id,
      activityType,
      activityData,
      {
        activitySubtype,
        sourcePage,
        apiEndpoint: req.path,
        method: req.method,
        statusCode: 200,
        success: true,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    return res.json({ success: true, message: 'Activity logged successfully' });
  } catch (error) {
    return next(error);
  }
});

// GET /api/activity/reports - Get user reports
router.get('/reports', authMiddleware, async (req, res, next) => {
  try {
    const { reportType, limit = 20 } = req.query;
    
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
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    
    return res.json({
      success: true,
      reports: result.rows
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/activity/reports - Generate a new report
router.post('/reports', authMiddleware, async (req, res, next) => {
  try {
    const { reportType, reportData, reportPeriodStart, reportPeriodEnd, generatedFor } = req.body;
    
    if (!reportType || !reportData) {
      return res.status(400).json({ 
        success: false, 
        message: 'reportType and reportData are required' 
      });
    }
    
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
        generatedFor || 'user',
        req.user.id,
        false,
        []
      ]
    );
    
    // Log the report generation activity
    await logActivity(
      req.user.id,
      'report_generation',
      { reportId: result.rows[0].id, reportType },
      {
        activitySubtype: reportType,
        sourcePage: req.body.sourcePage || 'user_dashboard',
        apiEndpoint: req.path,
        method: req.method,
        statusCode: 201,
        success: true
      }
    );
    
    return res.json({
      success: true,
      report: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/activity/reports/:id - Get specific report
router.get('/reports/:id', authMiddleware, async (req, res, next) => {
  try {
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
    
    // Log report view activity
    await logActivity(
      req.user.id,
      'report_view',
      { reportId: req.params.id, reportType: result.rows[0].report_type },
      {
        activitySubtype: result.rows[0].report_type,
        apiEndpoint: req.path,
        method: req.method,
        statusCode: 200,
        success: true
      }
    );
    
    return res.json({
      success: true,
      report: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
});

// Export the helper function and router
module.exports = { router, logActivity };