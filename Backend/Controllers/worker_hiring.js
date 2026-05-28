import WorkerHiring from "../Models/worker_hiring.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import WorkerProfile from "../Models/worker_profiles.js";
import User from "../Models/users.js";
import UserRole from "../Models/user_roles.js";
import Role from "../Models/roles.js";

export const get_contractor_worker_hiring = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // 1. Find the contractor's profile
        const contractor = await ContractorProfile.findOne({
            where: { user_id }
        });

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: "Contractor profile not found.",
            });
        }

        // 2. Fetch all hiring requests sent by this contractor
        const worker_hirings = await WorkerHiring.findAll({
            where: { contractor_id: contractor.contractor_id },
            include: [
                {
                    model: WorkerProfile,
                    include: [
                        {
                            model: User,
                            attributes: ["full_name", "email", "phone_number"],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']]
        });

        // 3. Sanitize data: only show contact info if status is 'accepted'
        const sanitizedHirings = worker_hirings.map(h => {
            const hiring = h.toJSON();
            const isAccepted = hiring.status === 'accepted';
            
            if (!isAccepted && hiring.WorkerProfile && hiring.WorkerProfile.User) {
                // Remove sensitive info if not accepted
                delete hiring.WorkerProfile.User.email;
                delete hiring.WorkerProfile.User.phone_number;
            }
            return hiring;
        });

        return res.status(200).json({
            success: true,
            message: "Contractor worker hirings fetched successfully",
            worker_hiring: sanitizedHirings,
        });
    } catch (error) {
        console.error("Error fetching contractor worker hiring:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Accept or reject a worker hiring request
export const update_worker_hiring_status = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const user_id = req.user.user_id;

    // Find the worker's profile first to get their inner worker_id
    const worker = await WorkerProfile.findOne({ where: { user_id } });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found." });
    }

    const worker_hiring = await WorkerHiring.findOne({ where: { hire_id: id } });

    if (!worker_hiring) {
      return res.status(404).json({
        success: false,
        message: "Worker hiring request not found.",
      });
    }

    // Verify this hiring belongs to the logged-in worker
    if (worker_hiring.worker_id !== worker.worker_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'accepted' or 'rejected'.",
      });
    }

    if (worker_hiring.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be updated.",
      });
    }

    worker_hiring.status = status;
    await worker_hiring.save();

    return res.status(200).json({
      success: true,
      message: `Worker hiring request ${status} successfully.`,
      worker_hiring,
    });
  } catch (error) {
    console.error("Error updating worker hiring status:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};