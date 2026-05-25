import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const TechnicalProposal = sequelize.define(
  "TechnicalProposal",
  {
    proposal_id: {
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
    method_description: {
      type: DataTypes.TEXT,
    },
    duration_days: {
      type: DataTypes.INTEGER,
    },
    team_size: {
      type: DataTypes.INTEGER,
    },
    equipment: {
      type: DataTypes.TEXT,
    },
    document_url: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "technical_proposals",
    timestamps: false,
  }
);

export default TechnicalProposal;