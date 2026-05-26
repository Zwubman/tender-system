import express from "express";
import sequelize from "../Configs/config.js";
import Role from "../Models/roles.js";

const router = express.Router();


router.get("/reset-database", async (req, res) => {
  try {
    console.log(" Resetting database...");

    // Drop and recreate all tables
    await sequelize.sync({ force: true });

    console.log(" Database reset successful");

    return res.status(200).json({
      success: true,
      message: "Database reset successfully. All tables dropped and recreated.",
    });

  } catch (error) {
    console.error(" Database reset failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database reset failed",
      error: error.message,
    });
  }
});

router.get("/auto-create", async () => {
  try {
    const roles = ["admin", "client", "contractor", "worker"];

    for (const role of roles) {
      const [createdRole, created] = await Role.findOrCreate({
        where: { name: role },
        defaults: { name: role },
      });

      if (created) {
        console.log(`${role} role created`);
      } else {
        console.log(`${role} role already exists`);
      }
    }

    console.log("All roles initialized successfully");
  } catch (error) {
    console.error("Error creating roles:", error);
  }
});

export default router;