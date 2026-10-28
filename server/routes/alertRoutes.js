const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  createAlert
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAlerts);
router.get('/:id', protect, getAlertById);
router.patch('/:id/status', protect, updateAlertStatus);
router.post('/', protect, createAlert);

module.exports = router;
