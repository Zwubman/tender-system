import WorkerHiring from "../Models/worker_hiring.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import User from "../Models/users.js";
import UserRole from "../Models/user_roles.js";
import Role from "../Models/roles.js";

export const get_contractor_worker_hiring = async (req, res) => {
    try {
        const contractor_id = req.query;
        const id = req.user.user_id;

        const user = await User.findOne({
            where: { user_id: contractor_id, status: "active" },
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

        if(role.name === "contractor"){
            if(contractor_id != id){
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access.",
                });
            }
        } else if(role.name === "admin"){
            // allow access to admin
        }else{
            return res.status(403).json({
                success: false,
                message: "Unauthorized access.",
            });
        }

        const worker_hiring = await WorkerHiring.findAll({
            where: { contractor_id: contractor_id },
            include: [
                {
                    model: WorkerProfile,
                    attributes: ["worker_id", "full_name", "skills", "experience"],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Contractor worker hirings fetched successfully",
            worker_hiring,
        });
    } catch (error) {
        console.error("Error fetching contractor worker hiring:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};