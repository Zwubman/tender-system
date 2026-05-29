import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";
import Tender from "./tenders.js";


const ClientProfile = sequelize.define(
  "ClientProfile",
  {
    client_id: {
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
    organization_name: {
      type: DataTypes.STRING(255),
    },
    organization_type: {
      type: DataTypes.STRING(100),
    },
    license_number: {
      type: DataTypes.STRING(100),
    },
    tin_number: {
      type: DataTypes.STRING(100),
    },
    region: {
      type: DataTypes.STRING(100),
    },
    city: {
      type: DataTypes.STRING(100),
    },
    sub_city: {
      type: DataTypes.STRING(100),
    },
    business_license_file: {
      type: DataTypes.STRING(255),
    },
    id_certificate_file: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    verification_status: {
      type: DataTypes.ENUM("pending", "verified", "suspended"),
      defaultValue: "pending",
    },
    suspension_reason: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "client_profiles",
    timestamps: true,
  }
);


ClientProfile.hasMany(Tender, {
  foreignKey: "client_id",
  onDelete: "CASCADE",
});

Tender.belongsTo(ClientProfile, {
  foreignKey: "client_id",
  onDelete: "CASCADE",
});

export default ClientProfile;