const express = require('express');
const bodyParser = require('body-parser');
const reports = require('./routes/reports');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Mock auth middleware to bypass authentication
app.use((req, res, next) => {
  req.user = { id: 'test-user-id', name: 'Test User', email: 'test@example.com', role: 'user' };
  next();
});

app.use('/api/reports', reports);

app.listen(3001, () => {
  console.log('Test server running on port 3001');
  console.log('Testing GET /api/reports...');
  
  // Test the route
  setTimeout(() => {
    fetch('http://localhost:3001/api/reports')
      .then(r => r.json())
      .then(data => console.log('Response:', JSON.stringify(data, null, 2)))
      .catch(e => console.error('Error:', e))
      .finally(() => process.exit(0));
  }, 500);
});
