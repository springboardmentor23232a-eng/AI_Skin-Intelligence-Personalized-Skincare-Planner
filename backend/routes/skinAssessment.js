const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        
        // Be more lenient with MIME type checking
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/octet-stream'];
        const mimetype = allowedMimeTypes.includes(file.mimetype);
        
        if (extname && (mimetype || !file.mimetype)) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
        }
    }
});

// Python API base URL
const PYTHON_API_URL = 'http://localhost:8001/api';
console.log('=== ROUTE FILE LOADED V2 ===');
console.log('PYTHON_API_URL:', PYTHON_API_URL);

// Add CORS headers to all responses
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Create skin assessment
router.post('/assessment', async (req, res) => {
    try {
        console.log('Received assessment request:', req.body);
        const response = await axios.post(`${PYTHON_API_URL}/assessment`, req.body);
        console.log('Python API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            console.error('Python API error response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to create assessment: ' + error.message });
        }
    }
});

// Get all assessments
router.get('/assessment', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/assessment`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to get assessments' });
    }
});

// Get specific assessment
router.get('/assessment/:id', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/assessment/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to get assessment' });
    }
});

// Update assessment
router.put('/assessment/:id', async (req, res) => {
    try {
        const response = await axios.put(`${PYTHON_API_URL}/assessment/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to update assessment' });
    }
});

// Delete assessment
router.delete('/assessment/:id', async (req, res) => {
    try {
        const response = await axios.delete(`${PYTHON_API_URL}/assessment/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to delete assessment' });
    }
});

// Get assessment history
router.get('/assessment/history/:userId', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/assessment/history?user_id=${req.params.userId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to get assessment history' });
    }
});

// Get risk factors
router.get('/assessment/risks/:id', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/assessment/risks/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to get risk factors' });
    }
});

// Get assessment score
router.get('/assessment/score/:id', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/assessment/score/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to get assessment score' });
    }
});

// Skin type classification from image
router.post('/predict-skin-type', upload.single('file'), async (req, res) => {
    try {
        console.log('Received file upload request');
        
        // Check if file was uploaded
        if (!req.file) {
            console.log('No file provided');
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);
        
        const form = new FormData();
        
        // Append the buffer from multer to form-data
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype || 'image/jpeg'
        });
        
        console.log('Sending request to Python API');
        const response = await axios.post(`${PYTHON_API_URL}/predict-skin-type`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        
        console.log('Python API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API for skin type prediction:', error.message);
        if (error.response) {
            console.error('Python API error response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to predict skin type: ' + error.message });
        }
    }
});

// Get classifier info
router.get('/classifier-info', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/classifier-info`);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to get classifier info' });
    }
});

// Skin Health Scoring Routes
// Calculate comprehensive skin health score
router.post('/skin-health/calculate', async (req, res) => {
    try {
        console.log('=== CALCULATE ENDPOINT CALLED ===');
        console.log('Received skin health score calculation request:', req.body);
        // Hardcoded URL to avoid caching issues
        const targetUrl = 'http://localhost:8001/api/skin-health/calculate';
        console.log('Full URL:', targetUrl);
        const response = await axios.post(targetUrl, req.body);
        console.log('Python API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('=== ERROR IN CALCULATE ===');
        console.error('Error calling Python API:', error.message);
        console.error('Error code:', error.code);
        console.error('Error config:', error.config);
        if (error.response) {
            console.error('Python API error response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to calculate skin health score: ' + error.message });
        }
    }
});

// Get current skin health score
router.get('/skin-health/current', async (req, res) => {
    try {
        // Forward authorization header to Python backend
        const headers = { ...req.headers };
        const params = {
            user_id: req.query.user_id || 'demo_user'
        };
        const response = await axios.get('http://localhost:8001/api/skin-health/current', { headers, params });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get current skin health score' });
        }
    }
});

// Get skin health score history
router.get('/skin-health/history', async (req, res) => {
    try {
        // Forward authorization header to Python backend
        const headers = { ...req.headers };
        const params = {
            user_id: req.query.user_id || 'demo_user',
            skip: req.query.skip || 0,
            limit: req.query.limit || 100
        };
        const response = await axios.get('http://localhost:8001/api/skin-health/history', { headers, params });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get skin health score history' });
        }
    }
});

// Get skin health trend
router.get('/skin-health/trend', async (req, res) => {
    try {
        // Forward authorization header to Python backend
        const headers = { ...req.headers };
        const params = {
            user_id: req.query.user_id || 'demo_user'
        };
        const response = await axios.get('http://localhost:8001/api/skin-health/trend', { headers, params });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to get skin health trend' });
        }
    }
});

module.exports = router;
