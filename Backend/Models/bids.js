import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";
import BidItem from "./bid_items.js";
import BidSecurity from "./bid_securities.js";
import TechnicalProposal from "./technical_proposals.js";
import ContractorProfile from "./contractor_profiles.js";


const Bid = sequelize.define(
  "Bid",
  {
    bid_id: {
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
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "contractor_profiles",
        key: "contractor_id",
      },
    },
    status: {
      type: DataTypes.ENUM("submitted", "under_review", "accepted", "rejected", "cancelled"),
      defaultValue: "submitted",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "bids",
    timestamps: true,
  }
);


ContractorProfile.hasMany(Bid, {
  foreignKey: "contractor_id",
  onDelete: "CASCADE",
});

Bid.belongsTo(ContractorProfile, {
  foreignKey: "contractor_id",
});


Bid.hasMany(BidItem, {
  foreignKey: "bid_id",
  onDelete: "CASCADE",
});

BidItem.belongsTo(Bid, {
  foreignKey: "bid_id",
});

// One bid → many securities (safe design)
Bid.hasOne(BidSecurity, {
  foreignKey: "bid_id",
  onDelete: "CASCADE",
});

BidSecurity.belongsTo(Bid, {
  foreignKey: "bid_id",
});

Bid.hasOne(TechnicalProposal, {
  foreignKey: "bid_id",
  onDelete: "CASCADE",
});

TechnicalProposal.belongsTo(Bid, {
  foreignKey: "bid_id",
});

export default Bid;