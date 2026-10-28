const Alert = require('../models/Alert');
const { logAction } = require('../services/auditService');

/**
 * @desc    Get all security alerts with filtering & search
 * @route   GET /api/alerts
 * @access  Private
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const { status, severity, resource, search, sort = '-detectedTime' } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    if (resource && resource !== 'all') {
      filter.resource = { $regex: resource, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { alertId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const alerts = await Alert.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single alert details
 * @route   GET /api/alerts/:id
 * @access  Private
 */
exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update alert status and triage notes
 * @route   PATCH /api/alerts/:id/status
 * @access  Private
 */
exports.updateAlertStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes, assignedTo } = req.body;

    const validStatuses = ['New', 'Investigating', 'Resolved', 'False Positive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const oldStatus = alert.status;
    alert.status = status;
    if (resolutionNotes !== undefined) alert.resolutionNotes = resolutionNotes;
    if (assignedTo !== undefined) alert.assignedTo = assignedTo;
    if (status === 'Resolved' || status === 'False Positive') {
      alert.resolvedAt = new Date();
    } else {
      alert.resolvedAt = null;
    }

    await alert.save();

    // Audit log
    await logAction({
      user: req.user,
      action: 'Alert Status Changed',
      resourceAffected: alert.resource,
      description: `Alert ${alert.alertId} status changed from '${oldStatus}' to '${status}' by ${req.user.name}`,
      ipAddress: req.ip,
      metadata: { alertId: alert.alertId, oldStatus, newStatus: status, resolutionNotes }
    });

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new alert (SOC analyst or external trigger)
 * @route   POST /api/alerts
 * @access  Private
 */
exports.createAlert = async (req, res, next) => {
  try {
    const {
      title,
      severity = 'Medium',
      resource,
      resourceType = 'EC2 Server',
      riskScore = 50,
      description,
      recommendedAction,
      source = 'AI Anomaly Detector'
    } = req.body;

    const alertId = `ALT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const alert = await Alert.create({
      alertId,
      title,
      severity,
      resource,
      resourceType,
      riskScore,
      description,
      recommendedAction: recommendedAction || 'Isolate instance and review audit logs.',
      source,
      status: 'New'
    });

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
