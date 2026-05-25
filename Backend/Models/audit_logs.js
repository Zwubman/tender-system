import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    action_type: {
      type: DataTypes.STRING(100),
    },
    entity_type: {
      type: DataTypes.STRING(100),
    },
    entity_id: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ip_address: {
      type: DataTypes.STRING(50),
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
  }
);

export default AuditLog;