import Tender from "../Models/tenders.js";
import BOQItem from "../Models/boq_items.js";
import Bid from "../Models/bids.js";
import BidItem from "../Models/bid_items.js";
import TechnicalProposal from "../Models/technical_proposals.js";
import BidSecurity from "../Models/bid_securities.js";
import ClientProfile from "../Models/client_profiles.js";
import User from "../Models/users.js";
import sequelize from "../Configs/config.js";
import ContractorProfile from "../Models/contractor_profiles.js";

export const create_tender = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      title,
      description,
      location,
      bid_security_requirement_amount,
      deadline,
    } = req.body || {};
    const user_id = req.user.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const client_profile = await ClientProfile.findOne({
      where: { user_id },
    });

    if (!client_profile) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found.",
      });
    }
    if (
      !title ||
      !description ||
      !location ||
      !deadline ||
      !bid_security_requirement_amount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, location, deadline, and bid_security_requirement_amount are required.",
      });
    }

    const new_tender = await Tender.create({
      client_id: client_profile.client_id,
      title,
      description,
      location,
      bid_security_required_amount: bid_security_requirement_amount,
      deadline,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Tender created successfully",
      tender: new_tender,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const get_tender_details = async (req, res) => {
  try {
    const tender_id = req.params.id;

    const tender = await Tender.findByPk(tender_id, {
      include: [
        {
          model: BOQItem,
          attributes: ["boq_id", "description", "item_no", "unit", "quantity"],
        },
      ],
    });

    if (!tender) {
      return res.status(404).json({ error: "Tender not found." });
    }

    const boq_items = await BOQItem.findAll({
      where: { tender_id },
    });

    if (boq_items.length > 0) {
      tender.boq_added = true;
      await tender.save();
    }

    res.status(200).json({
      success: true,
      message: "Tender details fetched successfully",
      tender: tender,
    });
  } catch (error) {
    console.error("Error fetching tender details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const get_client_tenders = async (req, res) => {
  try {
    const { client_id } = req.query;
    console.log("Fetching tenders for client_id:", req.query);
    if (!client_id) {
      return res
        .status(400)
        .json({ error: "client_id query parameter is required." });
    }

    const user = await User.findOne({ where: { user_id: client_id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const client_profile = await ClientProfile.findOne({
      where: { user_id: client_id },
    });

    if (!client_profile) {
      return res.status(404).json({ error: "Client profile not found." });
    }

    const tenders = await Tender.findAll({
      where: { client_id: client_profile.client_id },
      include: [
        {
          model: BOQItem,
          attributes: ["boq_id", "description", "item_no", "unit", "quantity"],
        },
      ],
    });

    const boq_items = await BOQItem.findAll({
      where: { tender_id: tenders.map((t) => t.tender_id) },
    });

    // Update boq_added for each tender
    for (const tender of tenders) {
      const has_boq_items = boq_items.some(
        (item) => item.tender_id === tender.tender_id,
      );
      if (has_boq_items) {
        tender.boq_added = true;
        await tender.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Client tenders fetched successfully",
      tenders,
    });
  } catch (error) {
    console.error("Error fetching client tenders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const add_boq_item = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Ensure the incoming data is treated as an array
    const boqItemsArray = Array.isArray(req.body) ? req.body : [req.body];

    if (boqItemsArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one BOQ item is required.",
      });
    }

    // 2. Check if the tender actually exists first
    const tender = await Tender.findByPk(id);
    if (!tender) {
      return res
        .status(404)
        .json({ success: false, error: "Tender not found." });
    }

    // 3. Carefully validate every item in the array
    for (const item of boqItemsArray) {
      if (!item.description || !item.item_no || !item.unit || !item.quantity) {
        return res.status(400).json({
          success: false,
          error:
            "Each BOQ item must include description, item_no, unit, and quantity.",
        });
      }
    }

    // 4. Map the array data to include the tender_id foreign key for each item
    const formattedItems = boqItemsArray.map((item) => ({
      tender_id: id,
      description: item.description,
      item_no: item.item_no,
      unit: item.unit,
      quantity: item.quantity,
    }));

    // 5. Perform a bulk database insert
    const createdItems = await BOQItem.bulkCreate(formattedItems);

    // 6. Update tender status flags
    tender.boq_added = true;
    await tender.save();

    return res.status(201).json({
      success: true,
      message: `${createdItems.length} BOQ items added successfully`,
      items: createdItems, // Returns the full list with database IDs
    });
  } catch (error) {
    console.error("Error adding BOQ items:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Get the boq of specific tender
export const get_tender_boq_items = async (req, res) => {
  try {
    const tender_id = req.params.id;

    const tender = await Tender.findByPk(tender_id);
    if (!tender) {
      return res.status(404).json({ error: "Tender not found." });
    }

    const boq_items = await BOQItem.findAll({
      where: { tender_id },
    });

    res.status(200).json({
      success: true,
      message: "BOQ items fetched successfully",
      boq_items,
    });
  } catch (error) {
    console.error("Error fetching BOQ items:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Submit bid for a tender
export const submit_bid = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const tender_id = req.params.id;
    const user_id = req.user.user_id;

    // Destructure request body
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

    const user = await User.findByPk(user_id);
    if (!user) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    console.log("User found:", user.email);

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

    // Prevent duplicate bid
    const existing_bid = await Bid.findOne({
      where: {
        tender_id,
        contractor_id,
      },
    });

    if (existing_bid) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "You have already submitted a bid for this tender.",
      });
    }

    const tender = await Tender.findOne({
      where: { tender_id },
    });

    if (!tender) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Tender not found.",
      });
    }

    if(tender.status !== "open"){
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "Bids can only be submitted to open tenders.",
      });
    }

    const compare_date = new Date(tender.deadline) < new Date(issue_date);

    if(compare_date){
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "Bid security issue date must be after tender deadline.",
      });
    }

    // Helper function for file URL
    const generateFileUrl = (file) => {
      if (!file) return null;

      return `${req.protocol}://${req.get("host")}/${file.path.replace(
        /\\/g,
        "/",
      )}`;
    };

    // Uploaded documents
    const technical_document = generateFileUrl(
      req.files?.technical_document?.[0],
    );

    const guarantee_document = generateFileUrl(
      req.files?.guarantee_document?.[0],
    );

    // Create bid
    const bid = await Bid.create(
      {
        tender_id,
        contractor_id,
      },
      { transaction: t },
    );

    // Create technical proposal
    await TechnicalProposal.create(
      {
        bid_id: bid.bid_id,
        method_description,
        duration_days,
        team_size,
        equipment,
        document_url: technical_document,
      },
      { transaction: t },
    );

    // Create bid security
    await BidSecurity.create(
      {
        bid_id: bid.bid_id,
        bank_name,
        guarantee_number,
        amount,
        issue_date,
        expiry_date,
        document_url: guarantee_document,
      },
      { transaction: t },
    );

    // HANDLE FINANCIAL ITEMS
    let parsedFinancialItems = [];

    if (financial_items) {
      parsedFinancialItems = JSON.parse(financial_items);

      // Ensure array
      if (!Array.isArray(parsedFinancialItems)) {
        throw new Error("financial_items must be an array");
      }

      // Prepare bid items
      const bidItemsData = parsedFinancialItems.map((item) => ({
        bid_id: bid.bid_id,
        boq_id: item.boq_id,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      // Bulk create bid items
      await BidItem.bulkCreate(bidItemsData, {
        transaction: t,
      });
    }

    // Commit transaction
    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      bid: {
        bid_id: bid.bid_id,
        tender_id: bid.tender_id,
        contractor_id: bid.contractor_id,
        status: bid.status,
        created_at: bid.createdAt,
      },
    });
  } catch (error) {
    // Rollback transaction
    await t.rollback();

    console.error("Error submitting bid:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get the available bids submitted to the specific tender
export const get_tender_bids = async (req, res) => {
  try {
    const tender_id = req.params.id;

    // Find tender
    const tender = await Tender.findOne({
      where: { tender_id },
    });

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: "Tender not found.",
      });
    }

    // Check deadline
    const financial_visible = new Date() > new Date(tender.deadline);

    // Fetch bids
    const bidsData = await Bid.findAll({
      where: { tender_id },

      include: [
        {
          model: User,
          attributes: ["full_name"],
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
            "document_url",
          ],
        },

        {
          model: BidItem,
          attributes: ["bid_item_id", "boq_id", "unit_price", "total_price"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    // Format response
    const bids = bidsData.map((bid) => ({
      bid_id: bid.bid_id,

      contractor_name: bid.User?.full_name,

      status: bid.status,

      created_at: bid.createdAt,

      financial_visible,

      technical_proposal: bid.TechnicalProposal,

      bid_security: bid.BidSecurity,

      // Hide financial items before deadline
      bid_items: financial_visible ? bid.BidItems : [],
    }));

    return res.status(200).json({
      success: true,
      message: "Bids fetched successfully",
      bids,
    });
  } catch (error) {
    console.error("Error fetching bids:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const publish_tender = async (req, res) => {
  try {
    const id = req.params.id;
    const tender = await Tender.findByPk(id);

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: "Tender not found.",
      });
    }

    const boq_items = await BOQItem.findAll({
      where: { tender_id: tender.tender_id },
    });

    if (boq_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish tender without BOQ items.",
      });
    }

    if(tender.status !== "draft"){
      return res.status(400).json({
        success: false,
        message: "Only tenders in draft status can be published.",
      });
    }

    tender.status = "open";
    await tender.save();

    return res.status(200).json({
      success: true,
      message: "Tender published successfully",
      tender,
    });
  } catch (error) {
    console.error("Error publishing tender:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// To retrieve open tender
export const get_open_tenders = async (req, res) => {
  try {
    const open_tenders = await Tender.findAll({
      where: { status: "open" },
      include: [
        {
          model: BOQItem,
          attributes: ["boq_id", "description", "item_no", "unit", "quantity"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Open tenders fetched successfully",
      tenders: open_tenders,
    });
  } catch (error) {
    console.error("Error fetching open tenders:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
