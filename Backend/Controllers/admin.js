import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import User from "../Models/users.js";
import UserRole from "../Models/user_roles.js";
import ClientProfile from "../Models/client_profiles.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import Role from "../Models/roles.js";
import Tender from "../Models/tenders.js";
import Bid from "../Models/bids.js";
import { createAuditLog } from "../Utils/audit_logger.js";

// To retrieve all users (for admin dashboard)

export const get_all_users = async (req, res) => {
  try {
    const { search, role } = req.query;

    const whereClause = { status: "active" };
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const includeRole = {
      model: Role,
      attributes: ["name"],
      through: { attributes: [] },
    };

    if (role) {
      includeRole.where = { name: role };
    }

    const users = await User.findAll({
      where: whereClause,
      include: [includeRole],
      order: [["createdAt", "DESC"]],
    });

    const formattedUsers = users.map((user) => {
      const userJson = user.toJSON();
      const userRole =
        userJson.Roles && userJson.Roles.length > 0
          ? userJson.Roles[0].name
          : null;
      delete userJson.Roles;
      return {
        ...userJson,
        role: userRole,
        user_role: userRole,
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
    }

    // Audit log
    await createAuditLog(
      req.user.user_id,
      "verify",
      "user",
      user.user_id,
      `${role.name.charAt(0).toUpperCase() + role.name.slice(1)} profile for ${user.email} verified by ${req.user.email}`,
      req.ip
    );

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
    const { reason } = req.body;

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
        message: "User has no role.",
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
      if (reason) contractor_profile.suspension_reason = reason;
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
      if (reason) worker_profile.suspension_reason = reason;
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
      if (reason) client_profile.suspension_reason = reason;
      await client_profile.save();
    }

    // Audit log
    await createAuditLog(
      req.user.user_id,
      "suspend",
      "user",
      user.user_id,
      `User ${user.email} (role: ${role.name}) suspended by ${req.user.email}. Reason: ${reason || "No reason provided"}`,
      req.ip
    );

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
        organization_type: clientProfile.organization_type,
        business_license_number: clientProfile.license_number,
        tin_number: clientProfile.tin_number,
        region: clientProfile.region,
        city: clientProfile.city,
        sub_city: clientProfile.sub_city,
        description: clientProfile.description,
      };

      // Client documents
      if (clientProfile.business_license_file) {
        documents.push({
          document_id: 1,
          type: "business_license",
          file_url: clientProfile.business_license_file,
          uploaded_at: clientProfile.createdAt,
        });
      }

      if (clientProfile.id_certificate_file) {
        documents.push({
          document_id: 2,
          type: "id_certificate",
          file_url: clientProfile.id_certificate_file,
          uploaded_at: clientProfile.createdAt,
        });
      }
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
        status: user.status,
        verification_status: "pending", // By definition for this endpoint

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
// get any user detail by id
export const get_user_detail = async (req, res) => {
  try {
    const user_id = req.params.id;

    // Find user first
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Role,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user_role = user.Roles && user.Roles.length > 0 ? user.Roles[0].name : null;

    let profile = null;
    let documents = [];

    //  WORKER PROFILE
    if (user_role === "worker") {
      const workerProfile = await WorkerProfile.findOne({
        where: { user_id },
      });

      if (workerProfile) {
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
    }

    //CONTRACTOR PROFILE
    if (user_role === "contractor") {
      const contractorProfile = await ContractorProfile.findOne({
        where: { user_id },
      });

      if (contractorProfile) {
        profile = {
          company_name: contractorProfile.company_name,
          license_number: contractorProfile.license_number,
          experience_years: contractorProfile.experience_years,
          specialization: contractorProfile.specialization,
          past_projects: contractorProfile.past_projects,
        };

        if (contractorProfile.license_document) {
          documents.push({
            document_id: 1,
            type: "license_document",
            file_url: contractorProfile.license_document,
            uploaded_at: contractorProfile.createdAt,
          });
        }
      }
    }

    // CLIENT PROFILE
    if (user_role === "client") {
      const clientProfile = await ClientProfile.findOne({
        where: { user_id },
      });

      if (clientProfile) {
        profile = {
          organization_name: clientProfile.organization_name,
          organization_type: clientProfile.organization_type,
          business_license_number: clientProfile.license_number,
          tin_number: clientProfile.tin_number,
          region: clientProfile.region,
          city: clientProfile.city,
          sub_city: clientProfile.sub_city,
          description: clientProfile.description,
        };

        if (clientProfile.business_license_file) {
          documents.push({
            document_id: 1,
            type: "business_license",
            file_url: clientProfile.business_license_file,
            uploaded_at: clientProfile.createdAt,
          });
        }

        if (clientProfile.id_certificate_file) {
          documents.push({
            document_id: 2,
            type: "id_certificate",
            file_url: clientProfile.id_certificate_file,
            uploaded_at: clientProfile.createdAt,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "User detail retrieved successfully",
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone_number,
        user_role: user_role,
        status: user.status,
        verification_status: (user_role === 'worker' ? (await WorkerProfile.findOne({where:{user_id}}))?.verification_status :
                             user_role === 'contractor' ? (await ContractorProfile.findOne({where:{user_id}}))?.verification_status :
                             user_role === 'client' ? (await ClientProfile.findOne({where:{user_id}}))?.verification_status : null),
        profile_image: user.profile_image || null,
        [`${user_role}_profile`]: profile,
        documents,
      },
    });
  } catch (error) {
    console.error("Error fetching user detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// add new admin
export const add_admin = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in the system.",
      });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const newUser = await User.create({
      full_name,
      email,
      phone_number: phone,
      password_hash: hashedPassword,
      status: "active",
    });

    // 4. Assign admin role
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    if (!adminRole) {
      return res.status(500).json({
        success: false,
        message: "Admin role not found in system.",
      });
    }

    await UserRole.create({
      user_id: newUser.user_id,
      role_id: adminRole.role_id,
    });

    // Audit log
    await createAuditLog(
      req.user.user_id,
      "create_admin",
      "user",
      newUser.user_id,
      `New admin created: ${newUser.email} by ${req.user.email}`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error adding admin:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Dashboard Statistics
export const get_admin_stats = async (req, res) => {
  try {
    // 1. Total Active Users
    const totalActiveUsers = await User.count({ where: { status: "active" } });

    // 2. Pending Approvals (Sum of pending from all 3 profile types)
    const pendingClients = await ClientProfile.count({ where: { verification_status: "pending" } });
    const pendingContractors = await ContractorProfile.count({ where: { verification_status: "pending" } });
    const pendingWorkers = await WorkerProfile.count({ where: { verification_status: "pending" } });
    const totalPendingApprovals = pendingClients + pendingContractors + pendingWorkers;

    // 3. New Tenders Today (created in last 24h)
    const yesterday = new Date(new Date() - 24 * 60 * 60 * 1000);
    const newTendersToday = await Tender.count({
      where: {
        createdAt: {
          [Op.gt]: yesterday,
        },
      },
    });

    // 4. Total Tenders
    const totalTenders = await Tender.count();

    // 5. Total Bids
    const totalBids = await Bid.count();

    // 6. Recent Users for Overview Table
    const recentUsers = await User.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Role,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    // Format recent users for frontend
    const formattedRecentUsers = recentUsers.map(u => ({
      id: u.user_id,
      username: u.full_name, // Using full name as display name
      email: u.email,
      role: u.Roles[0]?.name || "N/A",
      status: u.status,
      createdAt: u.createdAt
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalActiveUsers,
        totalPendingApprovals,
        newTendersToday,
        totalTenders,
        totalBids
      },
      recentUsers: formattedRecentUsers
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
