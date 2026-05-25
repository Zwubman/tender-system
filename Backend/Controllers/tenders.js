import Tender from "../Models/tenders.js";
import BOQItem from "../Models/boq_items.js";

export const create_tender = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      bid_security_required_amount,
      deadline,
      client_id,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !deadline ||
      !bid_security_required_amount
    ) {
      return res.status(400).json({
        error:
          "Title, description, location, deadline, and bid_security_required_amount are required.",
      });
    }

    const new_tender = await Tender.create({
      client_id,
      title,
      description,
      location,
      bid_security_required_amount,
      deadline,
      status: "draft",
    });

    res.status(201).json({
      success: true,
      message: "Tender created successfully",
      tender: {
        id: new_tender.tender_id,
        client_id: new_tender.client_id,
        project_title: new_tender.title,
        description: new_tender.description,
        location: new_tender.location,
        deadline: new_tender.deadline,
        bid_security_required_amount: new_tender.bid_security_required_amount,
        status: new_tender.status,
      },
    });
  } catch (error) {
    console.error("Error creating tender:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the tender." });
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
    res
      .status(500)
      .json({ error: "An error occurred while fetching the tender details." });
  }
};

export const get_client_tenders = async (req, res) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res
        .status(400)
        .json({ error: "client_id query parameter is required." });
    }

    const tenders = await Tender.findAll({
      where: { client_id },
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
    res
      .status(500)
      .json({ error: "An error occurred while fetching the client tenders." });
  }
};

export const add_boq_item = async (req, res) => {
  try {
    const id = req.params.id;
    const { description, item_no, unit, quantity } = req.body;

    if (!description || !item_no || !unit || !quantity) {
      return res.status(400).json({
        error: "Description, item_no, unit, and quantity are required.",
      });
    }

    const tender = await Tender.findByPk(id);
    if (!tender) {
      return res.status(404).json({ error: "Tender not found." });
    }

    const new_boq_item = await BOQItem.create({
      tender_id: id,
      description,
      item_no,
      unit,
      quantity,
    });

    tender.boq_added = true;
    await tender.save();

    res.status(201).json({
      success: true,
      message: "BOQ item added successfully",
      boq_id: new_boq_item.boq_id,
    });
  } catch (error) {
    console.error("Error adding BOQ item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the BOQ item." });
  }
};
