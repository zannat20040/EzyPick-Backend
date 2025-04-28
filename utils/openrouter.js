import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // ✅ Correct key name
  baseURL: "https://openrouter.ai/api/v1", // ✅ OpenRouter API
  defaultHeaders: {
    "HTTP-Referer": "https://yourwebsite.com", // Optional: your site
    "X-Title": "Your Website Name",             // Optional: your app name
  },
});

export const translateQuery = async (query) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-v3-base:free", // ✅ Correct DeepSeek V3 Free model
      messages: [
        {
          role: "system",
          content: "Translate Bangla search queries into English. If already English, just return it unchanged.",
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    if (completion?.choices && completion.choices.length > 0) {
      return completion.choices[0].message.content.trim();
    } else {
      console.error("⚠️ No translation response received.");
      return query; // fallback to original
    }
  } catch (error) {
    console.error("Translation failed:", error.message);
    return query; // fallback to original
  }
};
