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
    // STEP 1: Extract keywords from user message
    const intentRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
          You are a multilingual product filter extractor.
          
          Your task is to extract structured shopping filters from a user's message. The input can be in English, Bangla, or mixed.
          
          🎯 Output must be a **valid raw JSON object**, no extra text, no quotes around it, no prefix like "Output:"
          
          ✅ JSON object format:
          {
            "keywords": ["keyword1", "keyword2"],
            "minPrice": 0,          // optional
            "maxPrice": 1000,       // optional
            "minRating": 4.5        // optional
          }
          
          📌 Rules:
          - Return a valid JSON object only.
          - "keywords" must be an array with 1–3 lowercase, clean keywords.
          - Do NOT include explanations or anything outside the JSON.
          
          🧠 Example:
          User: "ঘড়ি দরকার ৫০০ টাকার নিচে"
          → { "keywords": ["watch"], "maxPrice": 500 }
          
          User: "smartwatch under 1500 with at least 4.2 rating"
          → { "keywords": ["smartwatch"], "maxPrice": 1500, "minRating": 4.2 }
          
          User: "dark spot remover cream"
          → { "keywords": ["dark spot remover cream"] }
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

    console.log("Intent:", parsed);

    const keywords = parsed.keywords || [];
    const minPrice = parsed.minPrice || 0;
    const maxPrice = parsed.maxPrice || Infinity;
    const minRating = parsed.minRating || 0;

    // STEP 2: Fetch product purchase counts
    const purchaseCounts = await getPurchaseCounts();

    // STEP 3: Find matching products
    const allProducts = await Product.find();
    const candidates = [];

    for (const product of allProducts) {
      const matchesKeyword =
        keywords.length === 0 ||
        keywords.some(
          (k) =>
            product.name.toLowerCase().includes(k) ||
            product.description.toLowerCase().includes(k) ||
            product.category.title.toLowerCase().includes(k) ||
            (Array.isArray(product.category.subcategory)
              ? product.category.subcategory.some((sub) =>
                  sub.toLowerCase().includes(k)
                )
              : product.category.subcategory.toLowerCase().includes(k))
        );

      console.log("matched", matchesKeyword, product.name);

      if (
        matchesKeyword &&
        product.price >= minPrice &&
        product.price <= maxPrice &&
        product.rating >= minRating
      ) {
        // STEP 4: Analyze reviews
        const reviews = await Review.find({ productId: product._id }).limit(5);
        let positiveCount = 0;

        for (const r of reviews) {
          const sentiment = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `
              You are a sentiment analysis expert.
              
              Your task is to classify customer product reviews based strictly on tone and emotion.
              
              Classify the following review as one of the following labels **only**:
              - "positive" → clearly shows satisfaction, praise, or happiness
              - "neutral" → factual, unclear, or balanced without strong emotion
              - "negative" → expresses dissatisfaction, complaints, or frustration
              
              ⚠️ Do NOT explain your answer.
              ⚠️ Return only one word: "positive", "neutral", or "negative".`.trim(),
              },
              { role: "user", content: r.reviewText },
            ],
            temperature: 0.3,
            max_tokens: 5,
          });

          const result =
            sentiment.choices?.[0]?.message?.content?.toLowerCase();
          console.log("review result", result);
          if (result.includes("positive")) positiveCount++;
        }

        console.log("positiveCount", positiveCount);
        // STEP 5: Score the product
        const purchaseCount = purchaseCounts[product._id.toString()] || 0;
        console.log("purchaseCount", purchaseCount);

        const score =
          positiveCount * 2 +
          product.rating +
          purchaseCount / 100 -
          product.price / 1000;

        console.log("score", score);

        candidates.push({ product, score, positiveCount });

      }
    }

    console.log("candidates", candidates);
    // STEP 6: Pick top 5 by score
    const sorted = candidates.sort((a, b) => b.score - a.score);
    const topPick = sorted[0];
    const others = sorted.slice(1, 5);

    if (sorted.length === 0) {
      return res.status(200).json({
        reply:
          "Sorry 😔, I couldn't find any highly rated products that match your need. Try asking differently?",
      });
    }

    // STEP 7: Build reply
    let reply = `🎯 Based on your needs, here's the **top recommended product**:\n\n`;

    reply += `👉 ${topPick.product.name} – ৳${topPick.product.price} (⭐ ${
      topPick.product.rating
    })\n🔗 https://next-ezypick.vercel.app/product/${encodeURIComponent(
      topPick.product.name
    )}/pid-${topPick.product._id}`;

    if (others.length > 0) {
      reply += `\n\n🛒 You might also consider these options:\n\n`;

      reply += others
        .map(
          ({ product }) =>
            `• ${product.name} – ৳${product.price} (⭐ ${
              product.rating
            })\n  🔗 https://next-ezypick.vercel.app/product/${encodeURIComponent(
              product.name
            )}/pid-${product._id}`
        )
        .join("\n\n");
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ message: "Chatbot failed" });
  }
};

module.exports = { AIChatbot };
