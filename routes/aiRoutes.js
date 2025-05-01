const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/searchController");
const { recommendProducts } = require("../controllers/productController");
const { trackUser } = require("../controllers/trackController");
const { AIrecommendProducts } = require("../controllers/AIrecommendController");
const { AIChatbot } = require("../controllers/chatbotController");

router.post("/search", searchProducts);
router.post("/recommend", recommendProducts);
router.post("/track-behavior", trackUser);
router.post("/airecommends", AIrecommendProducts);
router.post("/chatbot", AIChatbot);
module.exports = router;
