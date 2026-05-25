import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const WorkerApplication = sequelize.define(
  "WorkerApplication",
  {
    application_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "worker_profiles",
        key: "worker_id",
      },
    },
    tender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tenders",
        key: "tender_id",
      },
    },
    status: {
      type: DataTypes.ENUM("applied", "selected", "rejected"),
      defaultValue: "applied",
    },
  },
  {
    tableName: "worker_applications",
    timestamps: true,
  }
);

export default WorkerApplication;