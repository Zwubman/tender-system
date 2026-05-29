import WorkerProfile from "../Models/worker_profiles.js";
import WorkerApplication from "../Models/worker_applications.js";
import WorkerHiring from "../Models/worker_hiring.js";
import Role from "../Models/roles.js";
import UserRole from "../Models/user_roles.js";
import User from "../Models/users.js";
import WorkerRating from "../Models/worker_ratings.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";


export const create_worker_profile = async (req, res) => {
  try {
    const {
      user_id,
      gender,
      primary_skill,
      other_skills,
      experience_years,
      skill_level,
      availability,
      preferred_location,
      expected_wage,
      has_certification,
    } = req.body;

    let experience_document = null;

    if (req.files?.experience_document?.length > 0) {
      const uploadedFile = req.files.experience_document[0];

      experience_document = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(
        /\\/g,
        "/",
      )}`;
    }

    let certificate_file = null;

    if (has_certification === "true" || has_certification === true) {
      if (req.files?.certificate_file?.length > 0) {
        const uploadedFile = req.files.certificate_file[0];

        certificate_file = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(
          /\\/g,
          "/",
        )}`;
      }
    }

    const existing_user = await User.findOne({
      where: { user_id, status: "active" },
    });
    if (!existing_user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user_role = await UserRole.findOne({
      where: { user_id },
    });
    const role = await Role.findOne({
      where: { role_id: user_role.role_id },
    });

    if (role.name !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only users with worker role can create worker profile",
      });
    }

    const existing_profile = await WorkerProfile.findOne({
      where: { user_id },
    });
    if (existing_profile) {
      return res
        .status(400)
        .json({ success: false, message: "Worker profile already exists" });
    }

    const worker_profile = await WorkerProfile.create({
      user_id,
      gender,
      primary_skill,
      other_skills,
      experience_years,
      skill_level,
      availability,
      preferred_location,
      expected_wage,
      experience_document,
      has_certification,
      certificates_files: certificate_file,
    });

    return res.status(200).json({
      success: true,
      message: "Worker profile created successfully.",
      worker: worker_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const get_all_worker_profiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await WorkerProfile.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: WorkerApplication,
        },
        {
          model: WorkerHiring,
        },
        {
          model: User,
        },
        {
          model: WorkerRating,
        },
      ],
      distinct: true, // required for findAndCountAll with includes
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      workers: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching worker profiles:", error);
    return res.status(400).json({
      success: false,
      message: "Failed to fetch worker profiles",
      error: error.message,
    });
  }
};

export const get_worker_profile_by_id = async (req, res) => {
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
    const workerProfile = await WorkerProfile.findOne({
      where: { user_id: user.user_id },
      include: [
        {
          model: WorkerHiring,
        },
        {
          model: User,
        },
        {
          model: WorkerRating,
        }
      ],
    });

    if (!workerProfile) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      worker: workerProfile,
    });
  } catch (error) {
    console.error("Error fetching worker profile:", error);
    return res.status(400).json({
      success: false,
      message: "Failed to fetch worker profile",
      error: error.message,
    });
  }
};

export const update_worker_profile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const worker = await WorkerProfile.findOne({
      where: { user_id },
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    let up_to_date = { ...req.body };

    // Handle Experience Document replacement
    if (req.files?.experience_document?.length > 0) {
      if (worker.experience_document) {
        try {
          const oldUrl = worker.experience_document;
          const fileName = oldUrl.split("/").pop();
          const oldFilePath = path.join("uploads", "documents", fileName);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting experience document:", err);
        }
      }
      
      const uploadedFile = req.files.experience_document[0];
      up_to_date.experience_document = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(/\\/g, "/")}`;
    }

    // Handle Certificates replacement
    if (req.files?.certificate_file?.length > 0) {
      if (worker.certificates_files) {
        try {
          const oldUrl = worker.certificates_files;
          const fileName = oldUrl.split("/").pop();
          const oldFilePath = path.join("uploads", "documents", fileName);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting certificate file:", err);
        }
      }

      const uploadedFile = req.files.certificate_file[0];
      up_to_date.certificates_files = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(/\\/g, "/")}`;
    }

    up_to_date.verification_status = "pending";
    up_to_date.suspension_reason = null;

    await worker.update(up_to_date);

    // Re-fetch with User details included
    const updatedProfile = await WorkerProfile.findOne({
      where: { worker_id: worker.worker_id },
      include: [{ model: User }]
    });

    return res.status(200).json({
      success: true,
      message: "Worker profile updated successfully",
      worker: updatedProfile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update worker profile",
      error: error.message,
    });
  }
};

export const get_worker_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const worker_profile = await WorkerProfile.findOne({
      where: { user_id },
    });

    if (!worker_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Worker profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Worker profile retrieved successfully.",
      data: worker_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const delete_worker_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const worker_profile = await WorkerProfile.findOne({
      where: { user_id },
    });

    if (!worker_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Worker profile not found" });
    }

    await worker_profile.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Worker profile deleted successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};



// To submit a rating for a worker
export const rate_worker = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const id = req.params.id;
        const { rating, comment } = req.body;

        const user = await User.findOne({
            where: { user_id: user_id, status: "active" },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const worker = await WorkerProfile.findOne({
            where: { worker_id: id },
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker profile not found.",
            });
        }
        
        const worker_rating = await WorkerRating.create({
            worker_id: worker.worker_id,
            rated_by_user_id: user.user_id,
            rating,
            comment,
        });

        return res.status(201).json({
            success: true,
            message: "Worker rated successfully",
            rating: worker_rating,
        });
    } catch (error) {
        console.error("Error rating worker:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// To retrieve ratings for a worker
export const get_worker_ratings = async (req, res) => {
    try {
        const id = req.params.id;

        const worker = await WorkerProfile.findOne({
            where: { worker_id: id },
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker profile not found.",
            });
        }

        const ratings = await WorkerRating.findAll({
            where: { worker_id: worker.worker_id },
            include: [
                {
                    model: User,
                    attributes: ["user_id", "full_name"],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Worker ratings fetched successfully",
            ratings,
        });
    } catch (error) {
        console.error("Error fetching worker ratings:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Worker hiring by contractor
export const hire_worker = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const id = req.params.id;
    const { messages } = req.body;

    const user = await User.findOne({
      where: { user_id: user_id, status: "active" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const worker = await WorkerProfile.findOne({
      where: { worker_id: id },
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    const contractor = await ContractorProfile.findOne({
      where: { user_id: user.user_id },
    });

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: "Contractor profile not found.",
      });
    }

    const worker_hire = await WorkerHiring.findOne({
      where: {
        worker_id: worker.worker_id,
        contractor_id: contractor.contractor_id,
      },
    });

    if (worker_hire) {
      return res.status(400).json({
        success: false,
        message: "You have already hired this worker.",
      });
    }

    const worker_hiring = await WorkerHiring.create({
      contractor_id: contractor.contractor_id,
      worker_id: worker.worker_id,
      messages,
    });

    return res.status(201).json({
      success: true,
      message: "Worker hired successfully",
      hiring: worker_hiring,
    });
  } catch (error) {
    console.error("Error hiring worker:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// to get workers hiring notifications for a worker
export const get_worker_hiring_notifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const worker = await WorkerProfile.findOne({
      where: { user_id },
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    const { count, rows: hirings } = await WorkerHiring.findAndCountAll({
      where: { worker_id: worker.worker_id },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: ContractorProfile,
          include: [
            {
              model: User,
              attributes: ["user_id", "full_name", "email", "phone_number"],
            },
          ],
        },
      ],
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Worker hiring notifications fetched successfully",
      hirings,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching worker hiring notifications:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Worker by location, skill, experience and availability
export const search_workers = async (req, res) => {
  try {
    const { location, skill, experience_years, availability } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Location search
    if (location) {
      whereClause.preferred_location = {
        [Op.like]: `%${location}%`,
      };
    }

    // Skill search
    if (skill) {
      whereClause.primary_skill = {
        [Op.like]: `%${skill}%`,
      };
    }

    // Experience search
    if (experience_years) {
      whereClause.experience_years = experience_years;
    }

    // Availability search
    if (availability) {
      whereClause.availability = {
        [Op.like]: `%${availability}%`,
      };
    }

    const { count, rows } = await WorkerProfile.findAndCountAll({
      where: whereClause,

      limit,
      offset,

      include: [
        {
          model: User,
        },
        {
          model: WorkerRating,
        },
      ],

      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Workers fetched successfully",
      workers: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error searching workers:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const get_my_profile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const worker_profile = await WorkerProfile.findOne({
      where: { user_id },
      include: [{ model: User }],
    });

    if (!worker_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Worker profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Worker profile retrieved successfully.",
      worker: worker_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const get_hiring_notification_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Check if user is a contractor or worker
    const contractor = await ContractorProfile.findOne({ where: { user_id } });
    const worker     = await WorkerProfile.findOne({ where: { user_id } });

    if (!contractor && !worker) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    let hiring;

    if (contractor) {
      // If contractor, they must be the one who sent it
      hiring = await WorkerHiring.findOne({
        where: { hire_id: id, contractor_id: contractor.contractor_id },
        include: [
          {
            model: WorkerProfile,
            include: [{ model: User, attributes: ["full_name", "email", "phone_number"] }],
          },
        ],
      });
      
      // Sanitization: hide contact info if not accepted
      if (hiring && hiring.status !== 'accepted' && hiring.WorkerProfile?.User) {
        let hJson = hiring.toJSON();
        delete hJson.WorkerProfile.User.email;
        delete hJson.WorkerProfile.User.phone_number;
        hiring = hJson;
      }
    } else {
      // If worker, they must be the target
      hiring = await WorkerHiring.findOne({
        where: { hire_id: id, worker_id: worker.worker_id },
        include: [
          {
            model: ContractorProfile,
            include: [{ model: User, attributes: ["user_id", "full_name", "email", "phone_number"] }],
          },
        ],
      });
    }

    if (!hiring) {
      return res.status(404).json({ success: false, message: "Hiring notification not found." });
    }

    return res.status(200).json({
      success: true,
      hiring,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};