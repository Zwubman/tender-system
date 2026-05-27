import BOQItem from "../Models/boq_items.js";

// Delete a BOQ item
export const delete_boq_item = async (req, res) => {
  try {
    const  id  = req.params.id;
    const boqItem = await BOQItem.findByPk(id);

    if (!boqItem) {
      return res.status(404).json({
        success: false,
        message: "BOQ item not found.",
      });
    }

    await boqItem.destroy();

    return res.status(200).json({
      success: true,
      message: "BOQ item deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting BOQ item:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update a BOQ item
export const update_boq_item = async (req, res) => {
  try {
    const  id  = req.params.id;
    const { item_no, description, quantity, unit } = req.body;

    const boqItem = await BOQItem.findByPk(id);

    if (!boqItem) {
      return res.status(404).json({
        success: false,
        message: "BOQ item not found.",
      });
    }

    await boqItem.update({ item_no, description, quantity, unit });

    return res.status(200).json({
      success: true,
      message: "BOQ item updated successfully.",
    });
  } catch (error) {
    console.error("Error updating BOQ item:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
