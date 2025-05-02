const Product = require("../models/product");
const Review = require("../models/review");
const Order = require("../models/orderModel");
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Utility to calculate accepted purchase count per product
const getPurchaseCounts = async () => {
  const orders = await Order.find({ "items.status": "accepted" });
  const counts = {};

  for (const order of orders) {
    for (const item of order.items) {
      if (item.status === "accepted") {
        const productId = item.productId.toString();
        const quantity = item.quantity || 1;
        counts[productId] = (counts[productId] || 0) + quantity;
      }
    }
  }

  return counts;
};

const AIChatbot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required." });
  }

  try {
    // Step 1: Detect user intent
    const intentDetection = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Your job is to classify if a message is about product shopping or general chat.

Return only one of these:
- "shopping" → if the user is asking about products, price, rating, brand, category
- "general" → if the user says hi, how are you, asks for help, or has no shopping intent

Examples:
"hi there" → general
"need help" → general
"i want a facewash under 500" → shopping
"do you sell skincare?" → shopping`,
        },
        { role: "user", content: message },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const intent = intentDetection.choices?.[0]?.message?.content
      ?.trim()
      .toLowerCase();
    console.log("Detected intent:", intent);

    if (intent === "general") {
      const generalReply = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
    You're a friendly assistant. Reply very briefly and casually to general small talk. 
    Keep the reply under 20 words. Do not ask questions. 
    Examples:
    - "hi" → "Hey there!"
    - "how are you?" → "Doing great, thanks for asking!"
    - "i need help" → "Sure, I’m here to help with shopping!"`.trim(),
          },
          { role: "user", content: message },
        ],
        temperature: 0.6,
        max_tokens: 30,
      });
    
      return res.status(200).json({
        reply: generalReply.choices?.[0]?.message?.content?.trim() || "Hi there!",
      });
    }
    
    // Step 1: Extract intent
    const intentRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a multilingual product filter extractor.
Your task is to extract structured shopping filters from a user's message.
The input can be in English, Bangla, or mixed.
Translate Bangla keywords to English if needed.

DO NOT include generic words like “something”, “anything”, “item”, “product”.
Only include “minRating” if the user explicitly mentions a rating condition like "4 stars".

Return a raw valid JSON only. No explanation, no prefix.

Example:
"ঘড়ি দরকার ৫০০ টাকার নিচে" → { "keywords": ["watch"], "maxPrice": 500 }
"dry skin moisturizer" → { "keywords": ["moisturizer", "dry skin"] }
`.trim(),
        },
        { role: "user", content: message },
      ],
      temperature: 0.5,
      max_tokens: 100,
    });

    let parsed = {};
    try {
      parsed = JSON.parse(intentRes.choices?.[0]?.message?.content || "{}");
    } catch (e) {
      console.error("Intent parsing failed:", e.message);
    }

    if (!parsed.keywords || parsed.keywords.length === 0) {
      parsed.keywords = message
        .toLowerCase()
        .split(" ")
        .filter((word) => {
          const generic = ["product", "something", "anything", "item", "lagbe"];
          return word.length > 2 && !generic.includes(word);
        });
    }

    console.log("Intent:", parsed);

    const keywords = parsed.keywords || [];
    const minPrice = parsed.minPrice || 0;
    const maxPrice = parsed.maxPrice || Infinity;
    const minRating = parsed.minRating || 0;

    const purchaseCounts = await getPurchaseCounts();
    const allProducts = await Product.find();
    const candidates = [];

    for (const product of allProducts) {
      const discountedPrice =
        product.price - (product.price * (product.discount || 0)) / 100;

      const matchesKeyword =
        keywords.length === 0 ||
        keywords.some((k) =>
          [product.name, product.description, product.category.title]
            .concat(product.category.subcategory || [])
            .some((field) => field.toLowerCase().includes(k.toLowerCase()))
        );

      if (
        matchesKeyword &&
        discountedPrice >= minPrice &&
        discountedPrice <= maxPrice &&
        product.rating >= minRating
      ) {
        const reviews = await Review.find({ productId: product._id }).limit(3);
        let positiveCount = 0;

        for (const r of reviews) {
          const sentiment = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `
You are a sentiment classifier. Classify the review as:
- "positive"
- "neutral"
- "negative"
Return only one word.`.trim(),
              },
              { role: "user", content: r.reviewText },
            ],
            temperature: 0.3,
            max_tokens: 5,
          });

          const result =
            sentiment.choices?.[0]?.message?.content?.toLowerCase();
          if (result.includes("positive")) positiveCount++;
        }

        const purchaseCount = purchaseCounts[product._id.toString()] || 0;
        const score =
          positiveCount * 2 +
          product.rating +
          purchaseCount / 100 -
          discountedPrice / 1000;

        candidates.push({ product, score, positiveCount });
      }
    }

    const sorted = candidates.sort((a, b) => b.score - a.score);
    const topPick = sorted.find((item) => item.score > 0);
    const others = sorted.filter((item) => item !== topPick).slice(0, 5);

    if (!topPick && others.length === 0) {
      return res.status(200).json({
        reply: "🚫 Sorry, no product found matching your preference.",
      });
    }

    if (!topPick) {
      return res.status(200).json({
        reply:
          "🛒 I don't have a top recommendation, but here are a few you can check:",
        suggestions: others.map(({ product }) => ({
          name: product.name,
          price: product.price,
          rating: product.rating,
          url: `https://next-ezypick.vercel.app/product/${encodeURIComponent(
            product.name
          )}/pid-${product._id}`,
        })),
      });
    }

    return res.status(200).json({
      topPick: {
        name: topPick.product.name,
        price: topPick.product.price,
        rating: topPick.product.rating,
        url: `https://next-ezypick.vercel.app/product/${encodeURIComponent(
          topPick.product.name
        )}/pid-${topPick.product._id}`,
      },
      suggestions: others.map(({ product }) => ({
        name: product.name,
        price: product.price,
        rating: product.rating,
        url: `https://next-ezypick.vercel.app/product/${encodeURIComponent(
          product.name
        )}/pid-${product._id}`,
      })),
    });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ message: "Chatbot failed" });
  }
};

module.exports = { AIChatbot };
