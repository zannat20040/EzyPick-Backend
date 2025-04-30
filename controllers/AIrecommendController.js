const UserInteraction = require("../models/userInteraction");
const Product = require("../models/product");
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const recommendProducts = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "User email is required." });
  }

  try {
    const behavior = await UserInteraction.find({ email })
      .sort({ timestamp: -1 })
      .limit(30);

    const products = await Product.find().limit(100); // Keep it lean for token efficiency

    const catalog = products.map((p) => ({
      id: p._id.toString(), // important: convert ObjectId to string
      name: p.name,
      category: p.category.title,
      subcategory: p.category.subcategory,
      price: p.price,
      description: p.description,
      seller:p.sellerName
    }));

    const prompt = `
You are a product recommendation engine.

Your task:
- Analyze the user's behavior (clicks, searches, wishlist, cart, purchases)
- Match this behavior to the product catalog
- Recommend the 20 most relevant product IDs based on the user's interests.

⚠️ VERY IMPORTANT:
- Only return a clean JSON array of 20 product IDs (from the catalog below).
- No explanations. No formatting. No text. Only JSON array like: ["id1", "id2", ...]
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: JSON.stringify({ behavior, catalog }),
        },
      ],
      max_tokens: 700,
      temperature: 0.7,
    });


    const raw = completion.choices?.[0]?.message?.content?.trim();
    const recommendations = JSON.parse(raw);

    console.log("result:", completion.choices?.[0]?.message?.content);
    console.log("Recommendations:", recommendations);

    res.status(200).json({ recommendations }); // return only product IDs
  } catch (err) {
    console.error("AI Recommendation Error:", err.message);
    res.status(500).json({ message: "Recommendation failed" });
  }
};

module.exports = { recommendProducts };
