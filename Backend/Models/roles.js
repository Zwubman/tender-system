import { DataTypes } from "sequelize";
import sequelize from "../Configs/config.js";

const Role = sequelize.define(
  "Role",
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM("Admin", "Client", "Contractor", "Worker"),
      allowNull: false,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

export default Role;