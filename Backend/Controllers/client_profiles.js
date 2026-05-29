import ClientProfile from "../Models/client_profiles.js";
import Role from "../Models/roles.js";
import UserRole from "../Models/user_roles.js";
import User from "../Models/users.js";
import fs from "fs";
import path from "path";

export const create_client_profile = async (req, res) => {
  try {
    const {
      user_id,
      organization_name,
      organization_type,
      license_number,
      tin_number,
      region,
      city,
      sub_city,
      description,
    } = req.body;

    // Uploaded files URLs
    let business_license = null;

    if (req.files?.business_license?.length > 0) {
      const uploadedFile = req.files.business_license[0];

      business_license = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(
        /\\/g,
        "/",
      )}`;
    }

    let id_certificate = null;

    if (req.files?.id_certificate?.length > 0) {
      const uploadedFile = req.files.id_certificate[0];

      id_certificate = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(
        /\\/g,
        "/",
      )}`;
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

    if (role.name !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only users with client role can create client profile",
      });
    }

    const existing_profile = await ClientProfile.findOne({
      where: { user_id },
    });
    if (existing_profile) {
      return res
        .status(400)
        .json({ success: false, message: "Client profile already exists" });
    }

    const client_profile = await ClientProfile.create({
      user_id,
      organization_name,
      organization_type,
      license_number,
      tin_number,
      region,
      city,
      sub_city,
      description,
      id_certificate_file: id_certificate,
      business_license_file: business_license,
    });

    return res.status(200).json({
      success: true,
      message: "Client profile created successfully.",
      client: {
        client_id: client_profile.client_id,
        user_id: client_profile.user_id,
        organization_name: client_profile.organization_name,
        organization_type: client_profile.organization_type,
        license_number: client_profile.license_number,
        tin_number: client_profile.tin_number,
        region: client_profile.region,
        city: client_profile.city,
        sub_city: client_profile.sub_city,
        description: client_profile.description,
        id_certificate_file: client_profile.id_certificate_file,
        business_license_file: client_profile.business_license_file,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const get_client_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const client_profile = await ClientProfile.findOne({
      where: { user_id },
    });

    if (!client_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Client profile retrieved successfully.",
      client_profile: {
        client_id: client_profile.client_id,
        user_id: client_profile.user_id,
        organization_name: client_profile.organization_name,
        organization_type: client_profile.organization_type,
        license_number: client_profile.license_number,
        tin_number: client_profile.tin_number,
        region: client_profile.region,
        city: client_profile.city,
        sub_city: client_profile.sub_city,
        description: client_profile.description,
        id_certificate_file: client_profile.id_certificate_file,
        business_license_file: client_profile.business_license_file,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const get_all_client_profiles = async (req, res) => {
  try {
    const client_profiles = await ClientProfile.findAll({order: [["createdAt", "DESC"]],});

    return res.status(200).json({
      success: true,
      message: "Client profiles retrieved successfully.",
      client_profiles,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const update_client_profile = async (req, res) => {
  try {
    const {
      organization_name,
      organization_type,
      license_number,
      tin_number,
      region,
      city,
      sub_city,
      description,
    } = req.body;

    const user_id = req.user.user_id;
    const client_profile = await ClientProfile.findOne({ where: { user_id } });

    if (!client_profile) {
      return res.status(404).json({ success: false, message: "Client profile not found" });
    }

    let up_to_date = { ...req.body };

    // Handle Business License replacement
    if (req.files?.business_license_file?.length > 0) {
      if (client_profile.business_license_file) {
        try {
          const oldUrl = client_profile.business_license_file;
          const fileName = oldUrl.split("/").pop();
          const oldFilePath = path.join("uploads", "documents", fileName);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting old business license:", err);
        }
      }
      const uploadedFile = req.files.business_license_file[0];
      up_to_date.business_license_file = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(/\\/g, "/")}`;
    }

    // Handle ID Certificate replacement
    if (req.files?.id_certificate_file?.length > 0) {
      if (client_profile.id_certificate_file) {
        try {
          const oldUrl = client_profile.id_certificate_file;
          const fileName = oldUrl.split("/").pop();
          const oldFilePath = path.join("uploads", "documents", fileName);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting old ID certificate:", err);
        }
      }
      const uploadedFile = req.files.id_certificate_file[0];
      up_to_date.id_certificate_file = `${req.protocol}://${req.get("host")}/${uploadedFile.path.replace(/\\/g, "/")}`;
    }

    up_to_date.verification_status = "pending";
    up_to_date.suspension_reason = null;

    await client_profile.update(up_to_date);

    // Re-fetch to get associations if needed
    const updated = await ClientProfile.findOne({
      where: { user_id },
      include: [{ model: User }],
    });

    return res.status(200).json({
      success: true,
      message: "Client profile updated successfully.",
      client: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const delete_client_profile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const client_profile = await ClientProfile.findOne({
      where: { user_id },
    });

    if (!client_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found" });
    }

    await client_profile.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Client profile deleted successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const get_my_profile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const client_profile = await ClientProfile.findOne({
      where: { user_id },
      include: [{ model: User }],
    });

    if (!client_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Client profile retrieved successfully.",
      client: client_profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};