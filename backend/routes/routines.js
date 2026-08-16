const express = require('express');
const axios = require('axios');
const router = express.Router();

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

module.exports = router;