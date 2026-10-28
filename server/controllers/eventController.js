const SecurityEvent = require('../models/SecurityEvent');
const { calculateRiskScore } = require('../services/riskService');
const Alert = require('../models/Alert');

/**
 * @desc    Get all security events with comprehensive filtering and pagination
 * @route   GET /api/events
 * @access  Private
 */
exports.getEvents = async (req, res, next) => {
  try {
    const {
      severity,
      eventType,
      resource,
      search,
      startDate,
      endDate,
      limit = 50,
      page = 1
    } = req.query;

    const filter = {};

    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    if (eventType && eventType !== 'all') {
      filter.eventType = eventType;
    }
    if (resource && resource !== 'all') {
      filter.resource = { $regex: resource, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { eventId: { $regex: search, $options: 'i' } },
        { userOrIp: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, events] = await Promise.all([
      SecurityEvent.countDocuments(filter),
      SecurityEvent.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single security event by ID
 * @route   GET /api/events/:id
 * @access  Private
 */
exports.getEventById = async (req, res, next) => {
  try {
    const event = await SecurityEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Security event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log / Ingest a new security event (Calculates dynamic risk score)
 * @route   POST /api/events
 * @access  Private
 */
exports.createEvent = async (req, res, next) => {
  try {
    const {
      eventType,
      userOrIp,
      resource,
      resourceType = 'EC2 Server',
      severity = 'Medium',
      description,
      category = 'Authentication',
      metadata = {}
    } = req.body;

    // Generate readable event ID: e.g. SEC-2026-9812
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const eventId = `SEC-${new Date().getFullYear()}-${randomHex}`;

    // Calculate dynamic risk score based on transparent risk scoring engine
    const isAuthFailure = eventType.includes('Authentication') || eventType.includes('Failed Login');
    const isUnusualActivity = eventType.includes('Unusual') || eventType.includes('Suspicious');
    
    const riskAssessment = calculateRiskScore({
      severity,
      resourceType,
      frequency: metadata.requestCount || 1,
      isAuthFailure,
      isUnusualActivity
    });

    const newEvent = await SecurityEvent.create({
      eventId,
      eventType,
      userOrIp,
      resource,
      resourceType,
      severity,
      description,
      riskScore: riskAssessment.score,
      category,
      metadata
    });

    // Automatically generate an Alert if severity is Critical or High
    if (severity === 'Critical' || riskAssessment.score >= 75) {
      const alertId = `ALT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await Alert.create({
        alertId,
        title: `${eventType} on ${resource}`,
        severity,
        resource,
        resourceType,
        riskScore: riskAssessment.score,
        status: 'New',
        source: 'Rule Engine',
        description: `Automated alert triggered by high-risk event ${eventId}: ${description}`,
        recommendedAction: 'Investigate source IP and apply defensive security group / IAM restrictions.'
      });
    }

    res.status(201).json({
      success: true,
      data: newEvent,
      riskAssessment
    });
  } catch (error) {
    next(error);
  }
};
