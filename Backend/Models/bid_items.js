import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const BidItem = sequelize.define(
  "BidItem",
  {
    bid_item_id: {
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
    boq_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "boq_items",
        key: "boq_id",
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
    },
  },
  {
    tableName: "bid_items",
    timestamps: true,
  }
);

export default BidItem;