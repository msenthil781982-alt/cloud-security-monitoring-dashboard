const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, toggleUserStatus } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('Admin'), getUsers);
router.patch('/:id/role', protect, authorize('Admin'), updateUserRole);
router.patch('/:id/status', protect, authorize('Admin'), toggleUserStatus);

module.exports = router;
