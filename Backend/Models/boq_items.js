import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const BOQItem = sequelize.define(
  "BOQItem",
  {
    boq_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tenders",
        key: "tender_id",
      },
      onDelete: "CASCADE",
    },
    item_no: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    unit: {
      type: DataTypes.STRING(50),
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    tableName: "boq_items",
    timestamps: true,
  }
);

export default BOQItem;