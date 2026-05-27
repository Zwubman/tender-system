import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";
import BOQItem from "./boq_items.js";
import Bid from "./bids.js";
import WorkerApplication from "./worker_applications.js";

const Tender = sequelize.define(
  "Tender",
  {
    tender_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "client_profiles",
        key: "client_id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    location: {
      type: DataTypes.STRING(255),
    },
    deadline: {
      type: DataTypes.DATE,
    },
    bid_security_required_amount: {
      type: DataTypes.DECIMAL(15, 2),
    },
    boq_added: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "open", "closed", "evaluation", "awarded"),
      defaultValue: "draft",
    },
    selected_bid_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    selection_reason: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tenders",
    timestamps: true,
  },
);

Tender.hasMany(BOQItem, {
  foreignKey: "tender_id",
  onDelete: "CASCADE",
});

BOQItem.belongsTo(Tender, {
  foreignKey: "tender_id",
  onDelete: "CASCADE",
});

// One tender → many bids
Tender.hasMany(Bid, {
  foreignKey: "tender_id",
  onDelete: "CASCADE",
});

Bid.belongsTo(Tender, {
  foreignKey: "tender_id",
  onDelete: "CASCADE",
});

Tender.hasMany(WorkerApplication, {
  foreignKey: "tender_id",
  onDelete: "CASCADE",
});

WorkerApplication.belongsTo(Tender, {
  foreignKey: "tender_id",
  onDelete: "CASCADE",
});


export default Tender;
