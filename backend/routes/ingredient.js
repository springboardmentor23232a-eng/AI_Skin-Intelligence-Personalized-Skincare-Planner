const express = require('express');
const axios = require('axios');
const router = express.Router();

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001/api';

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

router.post('/analyze', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/ingredient/analyze`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error analyzing ingredient:', error.message);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(503).json({ error: 'Ingredient analysis service is unavailable' });
    }
});

router.post('/interactions', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/ingredient/interactions`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error analyzing ingredient interactions:', error.message);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(503).json({ error: 'Ingredient interaction service is unavailable' });
    }
});

module.exports = router;
