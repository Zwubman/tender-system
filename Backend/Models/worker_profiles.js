import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";
import WorkerApplication from "./worker_applications.js";
import WorkerHiring from "./worker_hiring.js";
import WorkerRating from "./worker_ratings.js";

const WorkerProfile = sequelize.define(
  "WorkerProfile",
  {
    worker_id: {
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
    // gender: {
    //   type: DataTypes.ENUM("Male", "Female"),
    //   allowNull: false,
    // },
    primary_skill: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    other_skills: {
      type: DataTypes.TEXT,
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    skill_level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    availability: {
      type: DataTypes.ENUM("Available", "Unavailable"),
      defaultValue: "Available",
      allowNull: false,
    },
    preferred_location: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    expected_wage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    experience_document: {
      type: DataTypes.STRING(255),
    },
    has_certification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    certificates_files: {
      type: DataTypes.STRING(255),
    },
    verification_status: {
      type: DataTypes.ENUM("pending", "verified", "suspended"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "worker_profiles",
    timestamps: true,
  },
);

WorkerProfile.hasMany(WorkerApplication, {
  foreignKey: "worker_id",
  onDelete: "CASCADE",
});

WorkerApplication.belongsTo(WorkerProfile, {
  foreignKey: "worker_id",
  onDelete: "CASCADE",
});

WorkerProfile.hasMany(WorkerHiring, {
  foreignKey: "worker_id",
  onDelete: "CASCADE",
});

WorkerHiring.belongsTo(WorkerProfile, {
  foreignKey: "worker_id",
  onDelete: "CASCADE",
});

WorkerProfile.hasMany(WorkerRating, {
  foreignKey: "worker_id",
  onDelete: "CASCADE",
});

WorkerRating.belongsTo(WorkerProfile, {
  foreignKey: "worker_id",
  onDelete: "CASCADE",
});

export default WorkerProfile;
