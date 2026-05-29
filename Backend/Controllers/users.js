import bcrypt from "bcryptjs";
import User from "../Models/users.js";
import ClientProfile from "../Models/client_profiles.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import { sendOTP } from "../Utils/email.js";

// Step 1: Request OTP
export const request_otp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.reset_otp = otp;
    user.reset_otp_expiry = expiry;
    await user.save();

    await sendOTP(email, otp);

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP Request Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Step 2: Verify OTP
export const verify_otp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.reset_otp !== otp || new Date() > user.reset_otp_expiry) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Step 3: Reset Password
export const reset_password = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.reset_otp !== otp || new Date() > user.reset_otp_expiry) {
      return res.status(400).json({ success: false, message: "Authorization failed" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    user.reset_otp = null;
    user.reset_otp_expiry = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resubmit_profile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { role } = req.user;

    let profile;
    if (role === "client") {
      profile = await ClientProfile.findOne({ where: { user_id } });
    } else if (role === "contractor") {
      profile = await ContractorProfile.findOne({ where: { user_id } });
    } else if (role === "worker") {
      profile = await WorkerProfile.findOne({ where: { user_id } });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    profile.verification_status = "pending";
    profile.suspension_reason = null;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile resubmitted successfully. Please wait for admin review.",
    });
  } catch (error) {
    console.error("Error resubmitting profile:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};