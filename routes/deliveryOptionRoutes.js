const express = require("express");
const router = express.Router();
const {
  getAllDeliveryOptions,
  addDeliveryOption,
} = require("../controllers/deliveryOptionController");

router.get("/deliveryoptions", getAllDeliveryOptions); 
router.post("/deliveryoptions", addDeliveryOption); 

module.exports = router;
