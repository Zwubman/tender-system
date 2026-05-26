import ContractorProfile from "../Models/contractor_profiles.js";
import User from "../Models/users.js";
import Role from "../Models/roles.js";
import UserRole from "../Models/user_roles.js";

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
    const contractor_profiles = await ContractorProfile.findAll();

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
    const { company_name, license_number, experience_years, specialization } =
      req.body;

    const user_id = req.user.id;

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

    await contractor_profile.update(up_to_date);

    return res.status(200).json({
      success: true,
      message: "Contractor profile updated successfully.",
      contractor: contractor_profile,
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
