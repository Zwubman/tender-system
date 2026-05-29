import AuditLog from "../Models/audit_logs.js";

/**
 * Utility function to create an audit log entry
 * @param {number} userId - The ID of the user performing the action
 * @param {string} actionType - The type of action (e.g., 'create', 'update', 'delete', 'approve')
 * @param {string} entityType - The type of entity being acted upon (e.g., 'tender', 'bid', 'user')
 * @param {number} entityId - The ID of the entity
 * @param {string} description - A detailed description of the action
 * @param {string} ipAddress - The IP address of the user (optional)
 * @returns {Promise<void>}
 */
export const createAuditLog = async (
  userId,
  actionType,
  entityType,
  entityId,
  description,
  ipAddress = ""
) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      description,
      ip_address: ipAddress,
    });
  } catch (error) {
    // We log the error but don't want to crash the main process if audit logging fails
    console.error("Failed to create audit log:", error);
  }
};
