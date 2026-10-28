const CloudResource = require('../models/CloudResource');
const { logAction } = require('../services/auditService');

/**
 * @desc    Get all cloud resources with filtering & search
 * @route   GET /api/resources
 * @access  Private
 */
exports.getResources = async (req, res, next) => {
  try {
    const { type, status, riskLevel, search, provider } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (riskLevel && riskLevel !== 'all') {
      filter.riskLevel = riskLevel;
    }
    if (provider && provider !== 'all') {
      filter.provider = provider;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await CloudResource.find(filter).sort({ securityScore: 1 }); // Lowest security score first

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single cloud resource by ID
 * @route   GET /api/resources/:id
 * @access  Private
 */
exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await CloudResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Cloud resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger simulated security audit/scan on a resource
 * @route   POST /api/resources/:id/scan
 * @access  Private
 */
exports.scanResource = async (req, res, next) => {
  try {
    const resource = await CloudResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Cloud resource not found'
      });
    }

    // Refresh last checked time and slightly re-evaluate score
    resource.lastChecked = new Date();
    await resource.save();

    await logAction({
      user: req.user,
      action: 'Resource Checked',
      resourceAffected: resource.name,
      description: `Manual security configuration scan completed for ${resource.name} (${resource.type})`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Security scan initiated and completed for ${resource.name}`,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new cloud resource (Admin only)
 * @route   POST /api/resources
 * @access  Private/Admin
 */
exports.createResource = async (req, res, next) => {
  try {
    const resource = await CloudResource.create(req.body);

    await logAction({
      user: req.user,
      action: 'Security Policy Updated',
      resourceAffected: resource.name,
      description: `New cloud resource registered: ${resource.name} (${resource.type})`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update resource configuration (Admin only)
 * @route   PUT /api/resources/:id
 * @access  Private/Admin
 */
exports.updateResource = async (req, res, next) => {
  try {
    const resource = await CloudResource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Cloud resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};
