# Node.js Integration Example

This shows how to integrate the Python/FastAPI skin assessment engine with your existing Node.js/Express backend.

## Installation

First, install axios in your Node.js backend:

```bash
cd backend
npm install axios
```

## Integration Code

Add this to your existing Node.js backend routes:

### 1. Create a new route file `backend/routes/skinAssessment.js`

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Python API base URL
const PYTHON_API_URL = 'http://localhost:8001/api';

// Create skin assessment
router.post('/assessment', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/assessment`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Python API:', error.message);
        res.status(500).json({ error: 'Failed to create assessment' });
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

module.exports = router;
```

### 2. Add to your main server.js

```javascript
const skinAssessmentRoutes = require('./routes/skinAssessment');

// Add this route
app.use('/api/skin', skinAssessmentRoutes);
```

## Frontend Integration

Your frontend can now call the Node.js endpoints:

```javascript
// Example: Create assessment
const response = await fetch('/api/skin/assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        age: 22,
        skin_type: 'oily',
        water_intake: 2,
        sleep_hours: 5,
        sun_exposure: 'high',
        smoking: false
    })
});

const assessment = await response.json();
console.log('Skin Health Score:', assessment.skin_health_score);
console.log('Concerns:', assessment.concerns);
console.log('Risk Factors:', assessment.risk_factors);
```

## Running Both Services

1. Start PostgreSQL database
2. Start Python/FastAPI service:
   ```bash
   cd python-engine
   python -m app.main
   ```
3. Start Node.js backend:
   ```bash
   cd backend
   npm start
   ```

Your Node.js backend will now proxy requests to the Python assessment engine!
