import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const UserRole = sequelize.define(
  "UserRole",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "role_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "role_id"], // UNIQUE(user_id, role_id)
      },
    ],
  }
);

export default UserRole;