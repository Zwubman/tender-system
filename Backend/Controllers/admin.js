import User from "../Models/users.js";
import UserRole from "../Models/user_roles.js";
import ClientProfile from "../Models/client_profiles.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import Role from "../Models/roles.js";

// To retrieve all users (for admin dashboard)
export const get_all_users = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: "active" },
      include: [
        {
          model: Role,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    const formattedUsers = users.map((user) => {
      const userJson = user.toJSON();
      const role =
        userJson.Roles && userJson.Roles.length > 0
          ? userJson.Roles[0].name
          : null;
      delete userJson.Roles;
      return {
        ...userJson,
        role: role,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: formattedUsers,
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

// get all pending
export const get_pending_users = async (req, res) => {
  try {
    const pendingContractors = await ContractorProfile.findAll({
      where: { verification_status: "pending" },
      include: [{ model: User }],
    });

    const pendingWorkers = await WorkerProfile.findAll({
      where: { verification_status: "pending" },
      include: [{ model: User }],
    });

    const pendingClients = await ClientProfile.findAll({
      where: { verification_status: "pending" },
      include: [{ model: User }],
    });

    // Contractors
    const contractorUsers = pendingContractors.map((contractor) => ({
      user_id: contractor.User.user_id,
      full_name: contractor.User.full_name,
      email: contractor.User.email,
      phone_number: contractor.User.phone_number,
      status: contractor.User.status,
      createdAt: contractor.User.createdAt,
      updatedAt: contractor.User.updatedAt,

      role: "contractor",
      profile_type: "contractor",

      verification_status: contractor.verification_status,
    }));

    // Workers
    const workerUsers = pendingWorkers.map((worker) => ({
      user_id: worker.User.user_id,
      full_name: worker.User.full_name,
      email: worker.User.email,
      phone_number: worker.User.phone_number,
      status: worker.User.status,
      createdAt: worker.User.createdAt,
      updatedAt: worker.User.updatedAt,

      role: "worker",
      profile_type: "worker",

      verification_status: worker.verification_status,
    }));

    // Clients
    const clientUsers = pendingClients.map((client) => ({
      user_id: client.User.user_id,
      full_name: client.User.full_name,
      email: client.User.email,
      phone_number: client.User.phone_number,
      status: client.User.status,
      createdAt: client.User.createdAt,
      updatedAt: client.User.updatedAt,

      role: "client",
      profile_type: "client",

      verification_status: client.verification_status,
    }));

    // Merge all
    const users = [...contractorUsers, ...workerUsers, ...clientUsers];

    return res.status(200).json({
      success: true,
      message: "Pending users retrieved successfully",
      total_pending_users: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// pending user detail by id
export const get_pending_user_detail = async (req, res) => {
  try {
    const user_id = req.params.id;

    // Find user first
    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = null;
    let profile_type = null;
    let documents = [];

    //  WORKER PROFILE

    const workerProfile = await WorkerProfile.findOne({
      where: {
        user_id,
        verification_status: "pending",
      },
    });

    if (workerProfile) {
      profile_type = "worker";

      profile = {
        primary_skill: workerProfile.primary_skill,
        other_skills: workerProfile.other_skills,
        years_of_experience: workerProfile.experience_years,
        skill_level: workerProfile.skill_level,
        availability: workerProfile.availability,
        preferred_location: workerProfile.preferred_location,
        expected_wage: workerProfile.expected_wage,
        has_certification: workerProfile.has_certification,
      };

      // Worker documents
      if (workerProfile.certificates_files) {
        documents.push({
          document_id: 1,
          type: "certificate",
          file_url: workerProfile.certificates_files,
          uploaded_at: workerProfile.createdAt,
        });
      }

      if (workerProfile.experience_document) {
        documents.push({
          document_id: 2,
          type: "experience_document",
          file_url: workerProfile.experience_document,
          uploaded_at: workerProfile.createdAt,
        });
      }
    }

    //CONTRACTOR PROFILE
    const contractorProfile = await ContractorProfile.findOne({
      where: {
        user_id,
        verification_status: "pending",
      },
    });

    if (contractorProfile) {
      profile_type = "contractor";

      profile = {
        company_name: contractorProfile.company_name,
        license_number: contractorProfile.license_number,
        experience_years: contractorProfile.experience_years,
        specialization: contractorProfile.specialization,
        past_projects: contractorProfile.past_projects,
      };

      // Contractor documents
      if (contractorProfile.license_document) {
        documents.push({
          document_id: 1,
          type: "license_document",
          file_url: contractorProfile.license_document,
          uploaded_at: contractorProfile.createdAt,
        });
      }
    }

    // CLIENT PROFILE
    const clientProfile = await ClientProfile.findOne({
      where: {
        user_id,
        verification_status: "pending",
      },
    });

    if (clientProfile) {
      profile_type = "client";

      profile = {
        organization_name: clientProfile.organization_name,
        address: clientProfile.address,
      };
    }

    // No pending profile found
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Pending profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending user detail retrieved successfully",
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone_number,
        user_role: profile_type,
        status: "pending",

        profile_image: user.profile_image || null,

        [`${profile_type}_profile`]: profile,

        documents,
      },
    });
  } catch (error) {
    console.error("Error fetching pending user detail:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
