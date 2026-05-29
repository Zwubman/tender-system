import AuditLog from "../Models/audit_logs.js";
import User from "../Models/users.js";

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      include: [
        {
          model: User,
          as: "User",
          attributes: ["full_name", "email"],
        },
      ],
      order: [["timestamp", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: logs,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["full_name", "email"],
        },
      ],
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
