import Bid from "../Models/bids.js";
import BidItem from "../Models/bid_items.js";
import TechnicalProposal from "../Models/technical_proposals.js";
import BidSecurity from "../Models/bid_securities.js";
import User from "../Models/users.js";
import Tender from "../Models/tenders.js";
import ContractorProfile from "../Models/contractor_profiles.js";

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
          attributes: [
            "bid_item_id",
            "boq_id",
            "unit_price",
            "total_price",
          ],
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

      bid_security: bid.BidSecurity,

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
    const { contractor_id} = req.query;

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
