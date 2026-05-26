import WorkerProfile from "../Models/worker_profiles.js";
import WorkerApplication from "../Models/worker_applications.js";
import WorkerHiring from "../Models/worker_hiring.js";
import Role from "../Models/roles.js";
import UserRole from "../Models/user_roles.js";
import User from "../Models/users.js";

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
    const workerProfiles = await WorkerProfile.findAll({
      include: [
        {
          model: WorkerApplication,
        },
        {
          model: WorkerHiring,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      workers: workerProfiles,
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
    const workerProfile = await WorkerProfile.findOne({
      where: { worker_id: req.params.id },
      include: [
        {
          model: WorkerApplication,
        },
        {
          model: WorkerHiring,
        },
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
    const worker = await WorkerProfile.findOne({
      where: { worker_id: req.params.id },
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    await worker.update(req.body);

    return res.status(200).json({
      success: true,
      worker,
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
