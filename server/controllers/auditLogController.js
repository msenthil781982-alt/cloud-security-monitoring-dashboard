const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get audit trail with filtering and pagination
 * @route   GET /api/audit-logs
 * @access  Private
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, user, search, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (action && action !== 'all') {
      filter.action = action;
    }
    if (user && user !== 'all') {
      filter.userName = { $regex: user, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { resourceAffected: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
