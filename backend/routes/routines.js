const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Python API base URL
const PYTHON_API_URL = 'http://localhost:8001/api';

// Add CORS headers to all responses
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Create skincare routine
router.post('/routine', async (req, res) => {
    try {
        console.log('Received routine creation request:', req.body);
        const response = await axios.post(`${PYTHON_API_URL}/routine`, req.body);
        console.log('Python API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            console.error('Python API error response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to create routine: ' + error.message });
        }
    }
});

// Get specific routine
router.get('/routine/:routineId', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/routine/${req.params.routineId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get routine: ' + error.message });
        }
    }
});

// Get all routines for a user
router.get('/routine/user/:userId', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/routine/user/${req.params.userId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get user routines: ' + error.message });
        }
    }
});

// Update routine
router.put('/routine/:routineId', async (req, res) => {
    try {
        const response = await axios.put(`${PYTHON_API_URL}/routine/${req.params.routineId}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to update routine: ' + error.message });
        }
    }
});

// Delete routine
router.delete('/routine/:routineId', async (req, res) => {
    try {
        const response = await axios.delete(`${PYTHON_API_URL}/routine/${req.params.routineId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to delete routine: ' + error.message });
        }
    }
});

// Get AI personalization
router.post('/routine/ai-personalize', async (req, res) => {
    try {
        console.log('Received AI personalization request:', req.body);
        const response = await axios.post(`${PYTHON_API_URL}/routine/ai-personalize`, req.body);
        console.log('Python API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            console.error('Python API error response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get AI personalization: ' + error.message });
        }
    }
});

// Get routine categories
router.get('/categories', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/categories/info`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get routine categories: ' + error.message });
        }
    }
});

// Check if routine needs update
router.post('/routine/:routineId/check-update', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/routine/${req.params.routineId}/check-update`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to check routine update: ' + error.message });
        }
    }
});

// Adapt routine to new assessment
router.post('/routine/:routineId/adapt', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/routine/${req.params.routineId}/adapt`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to adapt routine: ' + error.message });
        }
    }
});

// Regenerate routine completely
router.post('/routine/:routineId/regenerate', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/routine/${req.params.routineId}/regenerate`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to regenerate routine: ' + error.message });
        }
    }
});

// Track routine completion
router.post('/tracking', authMiddleware, async (req, res, next) => {
    try {
        const { routine_type, routine_name, steps, completion_status, completion_percentage, performed_date, notes } = req.body;
        
        const result = await pool.query(
            `INSERT INTO routine_tracking 
             (user_id, routine_type, routine_name, steps, completion_status, completion_percentage, performed_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                req.user.id,
                routine_type,
                routine_name,
                JSON.stringify(steps),
                completion_status,
                completion_percentage,
                performed_date,
                notes || null
            ]
        );
        
        return res.json({
            success: true,
            tracking: result.rows[0]
        });
    } catch (error) {
        return next(error);
    }
});

// Get routine tracking history
router.get('/tracking', authMiddleware, async (req, res, next) => {
    try {
        const { limit = 30, routineType } = req.query;
        
        let query = `
            SELECT * FROM routine_tracking
            WHERE user_id = $1
        `;
        const params = [req.user.id];
        
        if (routineType) {
            query += ` AND routine_type = $${params.length + 1}`;
            params.push(routineType);
        }
        
        query += ` ORDER BY performed_date DESC, created_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
        
        const result = await pool.query(query, params);
        
        return res.json({
            success: true,
            tracking: result.rows
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;