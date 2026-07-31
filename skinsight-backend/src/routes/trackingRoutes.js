const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  addLifestyle, listLifestyle,
  addSleep, listSleep,
  addHydration, listHydration,
  addEnvironment, listEnvironment,
} = require('../controllers/trackingController');

const router = express.Router();

router.post('/lifestyle', requireAuth, addLifestyle);
router.get('/lifestyle', requireAuth, listLifestyle);

router.post('/sleep', requireAuth, addSleep);
router.get('/sleep', requireAuth, listSleep);

router.post('/hydration', requireAuth, addHydration);
router.get('/hydration', requireAuth, listHydration);

router.post('/environment', requireAuth, addEnvironment);
router.get('/environment', requireAuth, listEnvironment);

module.exports = router;
