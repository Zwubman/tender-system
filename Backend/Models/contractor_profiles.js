import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";
import WorkerHiring from "./worker_hiring.js";

const ContractorProfile = sequelize.define(
  "ContractorProfile",
  {
    contractor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    company_name: {
      type: DataTypes.STRING(255),
    },
    license_number: {
      type: DataTypes.STRING(100),
    },
    experience_years: {
      type: DataTypes.INTEGER,
    },
    specialization: {
      type: DataTypes.STRING(255),
    },
    license_document: {
      type: DataTypes.STRING(255),
    },
    verification_status: {
      type: DataTypes.ENUM("pending", "verified", "suspended"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "contractor_profiles",
    timestamps: true,
  }
);

ContractorProfile.hasMany(WorkerHiring, {
  foreignKey: "contractor_id",
});

WorkerHiring.belongsTo(ContractorProfile, {
  foreignKey: "contractor_id",
});

export default ContractorProfile;