import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const WorkerHiring = sequelize.define(
  "WorkerHiring",
  {
    hire_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "contractor_profiles",
        key: "contractor_id",
      },
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "worker_profiles",
        key: "worker_id",
      },
    },
    messages: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "worker_hiring",
    timestamps: true,
  }
);

export default WorkerHiring;