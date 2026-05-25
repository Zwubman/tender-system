import express from "express";
import sequelize from "./Configs/config.js";
import dotenv from "dotenv";
import "./Models/audit_logs.js";
import "./Models/bid_items.js";
import "./Models/bid_securities.js";
import "./Models/bids.js";
import "./Models/boq_items.js";
import "./Models/client_profiles.js";
import "./Models/contractor_profiles.js";
import "./Models/documents.js";
import "./Models/roles.js";
import "./Models/technical_proposals.js";
import "./Models/tenders.js";
import "./Models/user_roles.js";
import "./Models/users.js";
import "./Models/worker_applications.js";
import "./Models/worker_hiring.js";
import "./Models/worker_profiles.js";
import "./Models/worker_ratings.js";
import path from "path";

// Import routes
import authRoutes from "./Routes/auth.js";
import roleRoutes from "./Routes/roles.js";
import resetDatabaseRoute from "./Routes/reset_database.js";
import workerProfileRoute from "./Routes/worker_profiles.js";
import clientProfileRoute from "./Routes/client_profile.js";
import contractorProfileRoute from "./Routes/contractor_profile.js";
import tenderRoutes from "./Routes/tenders.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Use routes
app.use("/auth", authRoutes);
app.use("/roles", roleRoutes);
app.use("/", resetDatabaseRoute);
app.use("/workers", workerProfileRoute);
app.use("/clients", clientProfileRoute);
app.use("/contractors", contractorProfileRoute);
app.use("/tenders", tenderRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // This creates tables automatically
    await sequelize.sync({ alter: true });
    console.log("Tables synchronized");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to DB:", error.message);
  }
};

startServer();
