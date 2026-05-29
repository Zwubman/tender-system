import User from "../Models/users.js";
import Role from "../Models/roles.js";
import ClientProfile from "../Models/client_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import UserRole from "../Models/user_roles.js";
import Document from "../Models/documents.js";
import bcrypt from "bcryptjs";
import sequelize from "../Configs/config.js";
import dotenv from "dotenv";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Utils/generate_tokens.js";
import { createAuditLog } from "../Utils/audit_logger.js";

dotenv.config();

export const register = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { full_name, email, phone_number, password, role } = req.body;

    //  VALIDATION
    if (!full_name || !email || !password || !role) {
      throw new Error("All required fields must be provided");
    }

    if (phone_number && !/^\+?[1-9]\d{1,14}$/.test(phone_number)) {
      throw new Error("Invalid phone number format");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    if (!["admin", "client", "contractor", "worker"].includes(role)) {
      throw new Error("Invalid role specified");
    }

    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser) throw new Error("Email already in use");

    // if (phone_number) {
    //   const existingPhone = await User.findOne({
    //     where: { phone_number },
    //     transaction: t,
    //   });
    //   if (existingPhone) throw new Error("Phone number already in use");
    // }

    //  CREATE USER
    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        full_name,
        email,
        phone_number,
        password_hash,
      },
      { transaction: t },
    );

    // ROLE
    const role_record = await Role.findOne({
      where: { name: role },
      transaction: t,
    });

    if (!role_record) throw new Error("Invalid role specified");

    await UserRole.create(
      {
        user_id: user.user_id,
        role_id: role_record.role_id,
      },
      { transaction: t },
    );

    //  COMMIT
    await t.commit();

    // Audit log
    await createAuditLog(
      user.user_id,
      "register",
      "user",
      user.user_id,
      `User ${user.email} registered with role ${role}`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        user_id: user.user_id,
        user_role: role_record.name,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
      },
    });
  } catch (error) {
    await t.rollback();

    return res.status(400).json({
      success: false,
      message: error.message,
      user: null,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email, status: "active" },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found with this email, please register first",
      });
    }

    // Find user role
    const user_role = await UserRole.findOne({
      where: { user_id: user.user_id },
    });

    // CHECK IF ROLE EXISTS
    if (!user_role) {
      return res.status(400).json({
        success: false,
        message: "No role assigned to this user",
      });
    }

    // Find role
    const role = await Role.findOne({
      where: { role_id: user_role.role_id },
    });

    // CHECK IF ROLE RECORD EXISTS
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role not found",
      });
    }

    let verification_status = null;
    if(role.name === "contractor") {
      const contractorProfile = await ContractorProfile.findOne({
        where: { user_id: user.user_id },
      });
      verification_status = contractorProfile ? contractorProfile.verification_status : null;
    } else if(role.name === "worker") {
      const workerProfile = await WorkerProfile.findOne({
        where: { user_id: user.user_id },
      });
      verification_status = workerProfile ? workerProfile.verification_status : null;
    }else if(role.name === "client") {
      const clientProfile = await ClientProfile.findOne({
        where: { user_id: user.user_id },
      });
      verification_status = clientProfile ? clientProfile.verification_status : null;
    }else if(role.name === "admin") {
      verification_status = "verified"; 
    }else{ 
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check password
    const is_match = await bcrypt.compare(password, user.password_hash);

    if (!is_match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const payload = {
      user_id: user.user_id,
      full_name: user.full_name,
      phone_number: user.phone_number,
      user_role: role.name,
      email: user.email,
      verification_status,
    };

    console.log("Login Payload:", payload);

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Audit log
    await createAuditLog(
      user.user_id,
      "login",
      "user",
      user.user_id,
      `User ${user.email} logged in successfully`,
      req.ip
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      user_token: {
        token: accessToken,
      },
      user: {
        id: user.user_id,
        role: role.name,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        verification_status,
      },
    });
  } catch (error) {
    // Audit log failed login
    console.error("Login attempt failed:", error.message);
    
    return res.status(400).json({
      success: false,
      message: error.message,
      user: null,
    });
  }
};

export const admin_seed = async (req, res) => {
  let t;

  try {
    t = await sequelize.transaction();

    const email = "admin@gmail.com";
    const password = "Admin@123";
    const full_name = "Admin User";
    const roleName = "Admin";

    const existing_admin = await User.findOne({ where: { email } });
    if (existing_admin)
      throw new Error("Admin user already exists with this email");

    const password_hash = await bcrypt.hash(password, 10);

    const new_admin = await User.create(
      {
        full_name,
        email,
        password_hash,
      },
      { transaction: t },
    );

    const role_record = await Role.findOne({
      where: { name: roleName },
      transaction: t,
    });

    if (!role_record) throw new Error("Admin role not found");

    await UserRole.create(
      {
        user_id: new_admin.user_id,
        role_id: role_record.role_id,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Admin user seeded successfully",
      data: new_admin,
    });
  } catch (error) {
    if (t) await t.rollback();

    return res.status(500).json({
      success: false,
      message: "Admin seeding failed",
      error: error.message,
    });
  }
};
