import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const Document = sequelize.define(
  "Document",
  {
    document_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.STRING(50),
    },
    file_url: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "documents",
    timestamps: true,
  }
);

export default Document;