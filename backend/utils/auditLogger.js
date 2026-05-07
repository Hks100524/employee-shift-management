const AuditLog = require("../models/AuditLog");

const createAuditLog = async (req, payload) => {
  try {
    await AuditLog.create({
      actor: req.user?._id || null,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId || null,
      metadata: payload.metadata || {},
      ip: req.ip,
      userAgent: req.get("user-agent") || "unknown",
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = createAuditLog;
