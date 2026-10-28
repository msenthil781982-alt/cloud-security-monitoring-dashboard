const AuditLog = require('../models/AuditLog');

/**
 * Log an administrative or analyst action into the audit trail
 * @param {Object} params
 * @param {Object} [params.user] - Request user object (req.user)
 * @param {string} params.action - Action name
 * @param {string} [params.resourceAffected='System'] - Resource affected
 * @param {string} params.description - Human readable explanation
 * @param {string} [params.ipAddress='127.0.0.1'] - Client IP address
 * @param {Object} [params.metadata={}] - Extra structured context
 */
async function logAction({
  user,
  action,
  resourceAffected = 'System',
  description,
  ipAddress = '127.0.0.1',
  metadata = {}
}) {
  try {
    const logEntry = new AuditLog({
      user: user?._id || user?.id || null,
      userName: user?.name || 'System Operator',
      userEmail: user?.email || 'system@cloudguard.io',
      userRole: user?.role || 'System',
      action,
      resourceAffected,
      description,
      ipAddress: ipAddress.replace(/^.*:/, '') || '127.0.0.1',
      metadata
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error(`[AuditService Error]: Failed to create audit log: ${error.message}`);
    // Non-blocking: Do not crash business operations if audit write fails
    return null;
  }
}

module.exports = {
  logAction
};
