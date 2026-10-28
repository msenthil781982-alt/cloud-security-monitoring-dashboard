const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident
} = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncidentById);
router.post('/', protect, createIncident);
router.patch('/:id', protect, updateIncident);

module.exports = router;
