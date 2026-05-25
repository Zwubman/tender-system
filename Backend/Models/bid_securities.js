import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const BidSecurity = sequelize.define(
  "BidSecurity",
  {
    security_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bid_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bids",
        key: "bid_id",
      },
      onDelete: "CASCADE",
    },
    bank_name: {
      type: DataTypes.STRING(150),
    },
    guarantee_number: {
      type: DataTypes.STRING(100),
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
    },
    issue_date: {
      type: DataTypes.DATEONLY,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
    },
    document_url: {
      type: DataTypes.TEXT,
    },
    verification_status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
    status: {
      type: DataTypes.ENUM("active", "forfeited", "released"),
      defaultValue: "active",
    },
  },
  {
    tableName: "bid_securities",
    timestamps: true,
  }
);

export default BidSecurity;