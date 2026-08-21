import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessment.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GlowSense AI API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/users', userRoutes);

// ML service proxy endpoint
app.post('/api/assessment/analyze', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlServiceUrl}/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    throw new Error('ML service unavailable');
  } catch (err) {
    res.status(503).json({ error: 'ML service is currently unavailable.' });
  }
});

app.post('/api/assessment/analyze-image', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    throw new Error('ML service unavailable');
  } catch (err) {
    res.status(503).json({ error: 'ML service is currently unavailable.' });
  }
});

app.listen(PORT, () => {
  console.log(`GlowSense AI backend running on port ${PORT}`);
});
