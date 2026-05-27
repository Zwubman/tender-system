import fs from "fs";
import path from "path";
import sequelize from "../Configs/config.js";
import User from "../Models/users.js";
import ContractorProfile from "../Models/contractor_profiles.js";
import Bid from "../Models/bids.js";
import Tender from "../Models/tenders.js";
import TechnicalProposal from "../Models/technical_proposals.js";
import BidSecurity from "../Models/bid_securities.js";
import BidItem from "../Models/bid_items.js";

//Get the detail information of the specific bid that submitted to the tender
export const get_bid_details = async (req, res) => {
  try {
    const id = req.params.id;

    // Find bid
    const bid = await Bid.findOne({
      where: { bid_id: id },

      include: [
        {
          model: ContractorProfile,
          include: [
            {
              model: User,
              attributes: ["full_name", "email", "phone_number"],
            },
          ],
        },

        {
          model: Tender,
          attributes: ["deadline"],
        },

        {
          model: TechnicalProposal,
          attributes: [
            "method_description",
            "duration_days",
            "team_size",
            "equipment",
            "document_url",
          ],
        },

        {
          model: BidSecurity,
          attributes: [
            "bank_name",
            "guarantee_number",
            "amount",
            "issue_date",
            "expiry_date",
            "verification_status",
            "document_url",
          ],
        },

        {
          model: BidItem,
          attributes: ["bid_item_id", "boq_id", "unit_price", "total_price"],
        },
      ],
    });

    // Check if bid exists
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found.",
      });
    }

    // Check financial visibility
    const financial_visible = new Date() > new Date(bid.Tender.deadline);

    // Format response
    const formattedBid = {
      bid_id: bid.bid_id,

      status: bid.status,

      contractor_name: bid.ContractorProfile.User?.full_name || null,

      contractor_email: bid.ContractorProfile.User?.email || null,

      contractor_phone: bid.ContractorProfile.User?.phone_number || null,

      technical_proposal: bid.TechnicalProposal,

      bid_security: bid.BidSecurities,
      financial_visible,

      financial_proposal: financial_visible ? bid.BidItems : [],
    };

    return res.status(200).json({
      success: true,
      message: "Bid details fetched successfully",
      bid: formattedBid,
    });
  } catch (error) {
    console.error("Error fetching bid details:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// To retrieve contractor's bid history
export const get_contractor_bids = async (req, res) => {
  try {
    const { contractor_id } = req.query;

    const user = await User.findOne({
      where: { user_id: contractor_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
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

    const bids = await Bid.findAll({
      where: { contractor_id: contractor.contractor_id },
      include: [
        {
          model: Tender,
          attributes: ["tender_id", "title", "deadline", "location"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Contractor bid history fetched successfully",
      bids,
    });
  } catch (error) {
    console.error("Error fetching contractor bid history:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE BID
export const update_bid = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const bid_id = req.params.id;
    const user_id = req.user.user_id;

    const {
      method_description,
      duration_days,
      team_size,
      equipment,
      bank_name,
      guarantee_number,
      amount,
      issue_date,
      expiry_date,
      financial_items,
    } = req.body;

    // FIND USER
    const user = await User.findByPk(user_id);

    if (!user) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // FIND CONTRACTOR PROFILE
    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id },
    });

    if (!contractor_profile) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Contractor profile not found.",
      });
    }

    const contractor_id = contractor_profile.contractor_id;

    // FIND BID
    const bid = await Bid.findOne({
      where: {
        bid_id,
        contractor_id,
      },
    });

    if (!bid) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Bid not found.",
      });
    }

    // FIND TENDER
    const tender = await Tender.findByPk(bid.tender_id);

    if (!tender) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Tender not found.",
      });
    }

    // ONLY OPEN TENDERS CAN BE UPDATED
    if (tender.status !== "open") {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "Only bids for open tenders can be updated.",
      });
    }

    // VALIDATE ISSUE DATE
    const issueDate = new Date(issue_date);
    const deadlineDate = new Date(tender.deadline);

    if (issueDate <= deadlineDate) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "Bid security issue date must be after tender deadline.",
      });
    }

    // HELPER FUNCTION
    const generateFileUrl = (file) => {
      if (!file) return null;

      return `${req.protocol}://${req.get("host")}/${file.path.replace(
        /\\/g,
        "/",
      )}`;
    };

    // DELETE OLD FILE
    const deleteOldFile = (fileUrl) => {
      try {
        if (!fileUrl) return;

        const filename = fileUrl.split("/").slice(3).join("/");

        const filePath = path.join(process.cwd(), filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("Deleted old file:", filePath);
        }
      } catch (error) {
        console.error("Error deleting file:", error.message);
      }
    };

    // FIND RELATED RECORDS
    const technicalProposal = await TechnicalProposal.findOne({
      where: { bid_id: bid.bid_id },
    });

    const bidSecurity = await BidSecurity.findOne({
      where: { bid_id: bid.bid_id },
    });

    // HANDLE TECHNICAL DOCUMENT UPDATE
    let technical_document = technicalProposal?.document_url;

    if (req.files?.technical_document?.[0]) {
      // DELETE OLD FILE
      deleteOldFile(technicalProposal?.document_url);

      // SAVE NEW FILE
      technical_document = generateFileUrl(req.files.technical_document[0]);
    }

    // HANDLE GUARANTEE DOCUMENT UPDATE
    let guarantee_document = bidSecurity?.document_url;

    if (req.files?.guarantee_document?.[0]) {
      // DELETE OLD FILE
      deleteOldFile(bidSecurity?.document_url);

      // SAVE NEW FILE
      guarantee_document = generateFileUrl(req.files.guarantee_document[0]);
    }

    // UPDATE TECHNICAL PROPOSAL
    await technicalProposal.update(
      {
        method_description,
        duration_days,
        team_size,
        equipment,
        document_url: technical_document,
      },
      { transaction: t },
    );

    // UPDATE BID SECURITY
    await bidSecurity.update(
      {
        bank_name,
        guarantee_number,
        amount,
        issue_date,
        expiry_date,
        document_url: guarantee_document,
      },
      { transaction: t },
    );

    // UPDATE FINANCIAL ITEMS
    if (financial_items) {
      const parsedFinancialItems = JSON.parse(financial_items);

      if (!Array.isArray(parsedFinancialItems)) {
        throw new Error("financial_items must be an array");
      }

      // DELETE OLD BID ITEMS
      await BidItem.destroy({
        where: { bid_id: bid.bid_id },
        transaction: t,
      });

      // CREATE NEW BID ITEMS
      const bidItemsData = parsedFinancialItems.map((item) => ({
        bid_id: bid.bid_id,
        boq_id: item.boq_id,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      await BidItem.bulkCreate(bidItemsData, {
        transaction: t,
      });
    }

    // COMMIT
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Bid updated successfully",
      bid: {
        bid_id: bid.bid_id,
        tender_id: bid.tender_id,
        contractor_id: bid.contractor_id,
      },
    });
  } catch (error) {
    await t.rollback();

    console.error("Error updating bid:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel bid
export const cancel_bid = async (req, res) => {
  try {
    const bid_id = req.params.id;
    const user_id = req.user.user_id;

    // FIND USER
    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user_role = await user.findOne({ where: { user_id } });

    if (user_role.name !== "contractor") {
      return res.status(403).json({
        success: false,
        message: "Only contractors can cancel bids.",
      });
    }

    // FIND CONTRACTOR PROFILE
    const contractor_profile = await ContractorProfile.findOne({
      where: { user_id },
    });

    if (!contractor_profile) {
      return res.status(404).json({
        success: false,
        message: "Contractor profile not found.",
      });
    }

    const bid = await Bid.findOne({
      where: {
        bid_id,
        contractor_id: contractor_profile.contractor_id,
      },
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found.",
      });
    }

    if (bid.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Bid is already cancelled.",
      });
    }

    await bid.update({ status: "cancelled" });

    return res.status(200).json({
      success: true,
      message: "Bid cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling bid:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
