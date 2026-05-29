import ContractorProfile from "../Models/contractor_profiles.js";
import User from "../Models/users.js";
import Role from "../Models/roles.js";
import UserRole from "../Models/user_roles.js";
import fs from "fs";
import path from "path";

export const create_contractor_profile = async (req, res) => {
  try {
    const {
      user_id,
      company_name,
      license_number,
      experience_years,
      specialization,
      past_projects,
    } = req.body;

    let license_document = null;

    if (req.file) {
      const uploadedFile = req.file;

      license_document = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(
        /\\/g,
        "/",
      )}`;
    }

    const user_role = await UserRole.findOne({
      where: { user_id },
    });
    const role = await Role.findOne({
      where: { role_id: user_role.role_id },
    });

    if (role.name !== "contractor") {
      return res.status(403).json({
        success: false,
        message:
          "Only users with contractor role can create contractor profile",
      });
    }

    const existing_user = await User.findOne({
      where: { user_id, status: "active" },
    });

    const existing_profile = await ContractorProfile.findOne({
      where: { user_id },
    });
    if (existing_profile) {
      return res
        .status(400)
        .json({ success: false, message: "Contractor profile already exists" });
    }

    const contractor_profile = await ContractorProfile.create({
      user_id,
      company_name,
      license_number,
      experience_years,
      specialization,
      license_document,
      past_projects,
    });

    return res.status(200).json({
      success: true,
      message: "Contractor profile created successfully.",
      contractor: contractor_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const get_contractor_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id },
    });

    if (!contractor_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Contractor profile retrieved successfully.",
      contractor: contractor_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const get_all_contractor_profiles = async (req, res) => {
  try {
    const contractor_profiles = await ContractorProfile.findAll({order: [["createdAt", "DESC"]],});

    return res.status(200).json({
      success: true,
      message: "Contractor profiles retrieved successfully.",
      contractors: contractor_profiles,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const update_contractor_profile = async (req, res) => {
  try {
    const { 
      company_name, 
      license_number, 
      experience_years, 
      specialization,
      past_projects 
    } = req.body;

    const user_id = req.user.user_id;

    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id },
    });

    if (!contractor_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor profile not found" });
    }

    let up_to_date = {};

    if (company_name) up_to_date.company_name = company_name;
    if (license_number) up_to_date.license_number = license_number;
    if (experience_years) up_to_date.experience_years = experience_years;
    if (specialization) up_to_date.specialization = specialization;
    if (past_projects) up_to_date.past_projects = past_projects;

    if (req.file) {
      // 1. Delete old file if exists
      if (contractor_profile.license_document) {
        try {
          // Extract filename from URL
          const oldUrl = contractor_profile.license_document;
          const urlParts = oldUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const oldFilePath = path.join("uploads", "documents", fileName);

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (fileError) {
          console.error("Error deleting old license file:", fileError);
        }
      }

      // 2. Set new file URL
      const uploadedFile = req.file;
      up_to_date.license_document = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(
        /\\/g,
        "/",
      )}`;
    }

    up_to_date.verification_status = "pending";
    up_to_date.suspension_reason = null;

    await contractor_profile.update(up_to_date);

    // Re-fetch with User details included
    const updatedProfile = await ContractorProfile.findOne({
      where: { contractor_id: contractor_profile.contractor_id },
      include: [{ model: User }]
    });

    return res.status(200).json({
      success: true,
      message: "Contractor profile updated successfully.",
      contractor: updatedProfile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const delete_contractor_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id },
    });

    if (!contractor_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor profile not found" });
    }

    await contractor_profile.destroy();

    return res.status(200).json({
      success: true,
      message: "Contractor profile deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// To get my profile information
export const get_my_profile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id },
      include: [{ model: User }],
    });

    if (!contractor_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Contractor profile retrieved successfully.",
      contractor: contractor_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// To get contractor profile by user_id
export const get_contractor_profile_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id: id },
      include: [{ model: User, attributes: ["full_name", "email", "phone_number", "status"] }],
    });

    if (!contractor_profile) {
      return res.status(404).json({
        success: false,
        message: "Contractor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      contractor: contractor_profile,
    });
  } catch (error) {
    console.error("Error fetching contractor profile:", error);
    return res.status(400).json({
      success: false,
      message: "Failed to fetch contractor profile",
      error: error.message,
    });
  }
};
