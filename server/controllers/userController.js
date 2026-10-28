const User = require('../models/User');
const { logAction } = require('../services/auditService');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Security Analyst'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be Admin or Security Analyst'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAction({
      user: req.user,
      action: 'User Role Changed',
      resourceAffected: user.email,
      description: `User ${user.name} role changed from '${oldRole}' to '${role}' by ${req.user.name}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from locking their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own administrator account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAction({
      user: req.user,
      action: 'Security Policy Updated',
      resourceAffected: user.email,
      description: `User ${user.name} account ${user.isActive ? 'activated' : 'deactivated'} by ${req.user.name}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};
