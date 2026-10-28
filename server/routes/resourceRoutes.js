const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  scanResource,
  createResource,
  updateResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, getResources);
router.get('/:id', protect, getResourceById);
router.post('/:id/scan', protect, scanResource);
router.post('/', protect, authorize('Admin'), createResource);
router.put('/:id', protect, authorize('Admin'), updateResource);

module.exports = router;
