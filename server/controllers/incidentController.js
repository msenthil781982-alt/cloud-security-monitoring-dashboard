const Incident = require('../models/Incident');
const { logAction } = require('../services/auditService');

/**
 * @desc    Get all security incidents with filtering
 * @route   GET /api/incidents
 * @access  Private
 */
exports.getIncidents = async (req, res, next) => {
  try {
    const { status, severity, priority, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (search) {
      filter.$or = [
        { incidentId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedAnalystName: { $regex: search, $options: 'i' } }
      ];
    }

    const incidents = await Incident.find(filter)
      .populate('assignedAnalyst', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single incident with full details and timeline
 * @route   GET /api/incidents/:id
 * @access  Private
 */
exports.getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('assignedAnalyst', 'name email role');
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Security incident not found'
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new security incident
 * @route   POST /api/incidents
 * @access  Private
 */
exports.createIncident = async (req, res, next) => {
  try {
    const {
      title,
      description,
      severity = 'High',
      priority = 'P2',
      assignedAnalyst,
      assignedAnalystName,
      affectedResources = [],
      linkedAlerts = [],
      rootCause,
      mitigationSteps
    } = req.body;

    const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const incident = await Incident.create({
      incidentId,
      title,
      description,
      severity,
      priority,
      status: 'Open',
      assignedAnalyst: assignedAnalyst || req.user._id,
      assignedAnalystName: assignedAnalystName || req.user.name,
      affectedResources,
      linkedAlerts,
      rootCause: rootCause || 'Under triage',
      mitigationSteps: mitigationSteps || 'Apply containment security policies',
      timeline: [
        {
          action: 'Incident Created',
          performedBy: req.user.name,
          timestamp: new Date(),
          notes: 'Initial ticket created by SOC team'
        }
      ]
    });

    await logAction({
      user: req.user,
      action: 'Incident Created',
      resourceAffected: affectedResources.join(', ') || 'Cloud Infrastructure',
      description: `Security incident created: [${incident.incidentId}] ${incident.title}`,
      ipAddress: req.ip,
      metadata: { incidentId: incident.incidentId, severity: incident.severity }
    });

    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update incident status, notes, or assigned analyst
 * @route   PATCH /api/incidents/:id
 * @access  Private
 */
exports.updateIncident = async (req, res, next) => {
  try {
    const {
      status,
      assignedAnalyst,
      assignedAnalystName,
      timelineNote,
      mitigationSteps,
      rootCause,
      severity,
      priority
    } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Security incident not found'
      });
    }

    const oldStatus = incident.status;

    if (status && ['Open', 'Investigating', 'Contained', 'Resolved'].includes(status)) {
      incident.status = status;
    }
    if (severity) incident.severity = severity;
    if (priority) incident.priority = priority;
    if (mitigationSteps) incident.mitigationSteps = mitigationSteps;
    if (rootCause) incident.rootCause = rootCause;
    if (assignedAnalyst) incident.assignedAnalyst = assignedAnalyst;
    if (assignedAnalystName) incident.assignedAnalystName = assignedAnalystName;

    // Append to timeline
    if (timelineNote || (status && status !== oldStatus)) {
      incident.timeline.push({
        action: status && status !== oldStatus ? `Status changed to ${status}` : 'Investigation Update',
        performedBy: req.user.name,
        timestamp: new Date(),
        notes: timelineNote || `Status updated from ${oldStatus} to ${status}`
      });
    }

    await incident.save();

    await logAction({
      user: req.user,
      action: 'Incident Updated',
      resourceAffected: incident.affectedResources.join(', ') || 'Infrastructure',
      description: `Incident [${incident.incidentId}] updated by ${req.user.name}: Status is ${incident.status}`,
      ipAddress: req.ip,
      metadata: { incidentId: incident.incidentId, status: incident.status }
    });

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};
