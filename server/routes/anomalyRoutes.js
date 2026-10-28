const express = require('express');
const router = express.Router();
const { analyze, getScenarios } = require('../controllers/anomalyController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyze);
router.get('/scenarios', protect, getScenarios);

module.exports = router;
