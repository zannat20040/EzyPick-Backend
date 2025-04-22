const DeliveryOption = require("../models/deliveryOptions");

// GET all delivery options
const getAllDeliveryOptions = async (req, res) => {
  try {
    const options = await DeliveryOption.find().sort({ createdAt: -1 });
    res.status(200).json({ options });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch delivery options", error: err.message });
  }
};

// POST new delivery option
const addDeliveryOption = async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Delivery option title is required." });
  }

  try {
    const exists = await DeliveryOption.findOne({ title: title.trim() });
    if (exists) {
      return res.status(409).json({ message: "Option already exists." });
    }

    const newOption = new DeliveryOption({ title: title.trim() });
    await newOption.save();

    res.status(201).json({ message: "Option added successfully", option: newOption });
  } catch (err) {
    res.status(500).json({ message: "Failed to add delivery option", error: err.message });
  }
};

module.exports = {
  getAllDeliveryOptions,
  addDeliveryOption,
};
