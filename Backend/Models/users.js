import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";
import Role from "./roles.js";
import UserRole from "./user_roles.js";
import ClientProfile from "./client_profiles.js";
import ContractorProfile from "./contractor_profiles.js";
import WorkerProfile from "./worker_profiles.js";
import Document from "./documents.js";
import WorkerRating from "./worker_ratings.js";
import AuditLog from "./audit_logs.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "suspended"),
      defaultValue: "active",
    },
    reset_otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    reset_otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "role_id",
  onDelete: "CASCADE",
});

User.hasOne(ClientProfile, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

ClientProfile.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasOne(ContractorProfile, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

ContractorProfile.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasOne(WorkerProfile, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

WorkerProfile.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(Document, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Document.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(WorkerRating, {
  foreignKey: "rated_by_user_id",
  onDelete: "CASCADE",
});

WorkerRating.belongsTo(User, {
  foreignKey: "rated_by_user_id",
  onDelete: "CASCADE",
});

User.hasMany(AuditLog, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

AuditLog.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

export default User;
