import Role from "../Models/roles.js";

export const create_role = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Role name is required" });
    }
    if (!["Admin", "Client", "Contractor", "Worker"].includes(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role name" });
    }
    const role = await Role.create({ name });
    res
      .status(200)
      .json({
        success: true,
        message: "Role created successfully",
        data: role,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const get_all_roles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res
      .status(200)
      .json({
        success: true,
        message: "Roles retrieved successfully",
        data: roles,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const get_role_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Role retrieved successfully",
        data: role,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update_role = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Role name is required" });
    }
    if (!["Admin", "Client", "Contractor", "Worker"].includes(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role name" });
    }
    const role = await Role.findByPk(id);
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }
    role.name = name;
    await role.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Role updated successfully",
        data: role,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const delete_role = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }
    await role.destroy();
    res
      .status(200)
      .json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
