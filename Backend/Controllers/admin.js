import User from "../Models/users.js";
import UserRole from "../Models/user_roles.js";
import ClientProfile from "../Models/client_profiles.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import Role from "../Models/roles.js";

// To retrieve all users (for admin dashboard)
export const get_all_users = async (req, res) => {
  try {
    const users = await User.findAll({ where: { status: "active" } });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// To verify users status (for admin dashboard)
export const verify_user = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({
      where: { user_id: id, status: "active" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user_role = await UserRole.findOne({
      where: { user_id: user.user_id },
    });

    if (!user_role) {
      return res.status(404).json({
        success: false,
        message: "User has not role.",
      });
    }

    const role = await Role.findOne({ where: { role_id: user_role.role_id } });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "User role not found.",
      });
    }

    if (role.name === "contractor") {
      const contractor_profile = await ContractorProfile.findOne({
        where: { user_id: user.user_id },
      });

      if (!contractor_profile) {
        return res.status(404).json({
          success: false,
          message: "Contractor profile not found.",
        });
      }

      contractor_profile.verification_status = "verified";
      await contractor_profile.save();
    } else if (role.name === "worker") {
      const worker_profile = await WorkerProfile.findOne({
        where: { user_id: user.user_id },
      });

      if (!worker_profile) {
        return res.status(404).json({
          success: false,
          message: "Worker profile not found.",
        });
      }

      worker_profile.verification_status = "verified";
      await worker_profile.save();
    } else if (role.name === "client") {
      const client_profile = await ClientProfile.findOne({
        where: { user_id: user.user_id },
      });

      if (!client_profile) {
        return res.status(404).json({
          success: false,
          message: "Client profile not found.",
        });
      }

      client_profile.verification_status = "verified";
      await client_profile.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// To suspend users (for admin dashboard)
export const suspend_user = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({
      where: { user_id: id, status: "active" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user_role = await UserRole.findOne({
      where: { user_id: user.user_id },
    });

    if (!user_role) {
      return res.status(404).json({
        success: false,
        message: "User has not role.",
      });
    }

    const role = await Role.findOne({ where: { role_id: user_role.role_id } });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "User role not found.",
      });
    }

    if (role.name === "contractor") {
      const contractor_profile = await ContractorProfile.findOne({
        where: { user_id: user.user_id },
      });

      if (!contractor_profile) {
        return res.status(404).json({
          success: false,
          message: "Contractor profile not found.",
        });
      }

      contractor_profile.verification_status = "suspended";
      await contractor_profile.save();
    } else if (role.name === "worker") {
      const worker_profile = await WorkerProfile.findOne({
        where: { user_id: user.user_id },
      });

      if (!worker_profile) {
        return res.status(404).json({
          success: false,
          message: "Worker profile not found.",
        });
      }

      worker_profile.verification_status = "suspended";
      await worker_profile.save();
    } else if (role.name === "client") {
      const client_profile = await ClientProfile.findOne({
        where: { user_id: user.user_id },
      });

      if (!client_profile) {
        return res.status(404).json({
          success: false,
          message: "Client profile not found.",
        });
      }

      client_profile.verification_status = "suspended";
      await client_profile.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User suspended successfully",
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
