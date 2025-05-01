// This service handles the communication with OpenAI's API

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function fetchWithRetry(fn: () => Promise<Response>, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fn();
      if (res.status !== 429) return res;
      console.warn(`OpenAI 429 received (attempt ${i + 1}) - retrying...`);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
  }
  throw new Error("Max retries reached (OpenAI API)");
}

// Accepted categories in your app
const ALLOWED_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Other"
];

// Map AI terms to allowed categories
const CATEGORY_MAP: Record<string, string> = {
  groceries: "Food",
  food: "Food",
  dining: "Food",
  restaurant: "Food",
  eat: "Food",
  clothing: "Shopping",
  clothes: "Shopping",
  transport: "Transportation",
  transportation: "Transportation",
  fuel: "Transportation",
  petrol: "Transportation",
  rent: "Rent",
  utility: "Utilities",
  utilities: "Utilities",
  internet: "Utilities",
  electricity: "Utilities",
  water: "Utilities",
  shopping: "Shopping",
  entertainment: "Entertainment",
  movies: "Entertainment",
  cinema: "Entertainment"
};

function normalizeCategory(raw: string): string {
  const key = raw?.toLowerCase().trim();
  const mapped = CATEGORY_MAP[key];
  if (mapped && ALLOWED_CATEGORIES.includes(mapped)) return mapped;
  return ALLOWED_CATEGORIES.includes(raw) ? raw : "Other";
}

export async function processReceiptWithOpenAI(file: File, apiKey: string): Promise<any> {
  try {
    if (!file || file.size === 0) throw new Error("Invalid file");

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = bufferToBase64(arrayBuffer);

    const prompt = `Extract receipt information as JSON in this format:
{
  "date": "YYYY-MM-DD",
  "items": [
    {
      "description": "item name",
      "amount": "0.00",
      "category": "category",
      "date": "YYYY-MM-DD",
      "paymentMethod": "Card"
    }
  ]
}`;

    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${file.type};base64,${base64Image}` }
            }
          ]
        }
      ],
      max_tokens: 1500
    };

    const response = await fetchWithRetry(() =>
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API failed:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      content.match(/{[\s\S]*}/);

    const jsonString = jsonMatch?.[1] || jsonMatch?.[0];
    if (!jsonString) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonString);

    if (!parsed.items || !Array.isArray(parsed.items)) {
      parsed.items = [{
        description: "Unknown Item",
        amount: parsed.total || "0.00",
        category: "Other",
        date: parsed.date || new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }];
    }

    // Normalize categories to ensure they're valid in your app
    parsed.items = parsed.items.map((item: any) => ({
      ...item,
      category: normalizeCategory(item.category),
      amount: parseFloat(item.amount || "0").toFixed(2)
    }));

    return parsed;

  } catch (error) {
    console.error("Final fallback - returning default receipt structure:", error);
    return {
      date: new Date().toISOString().split('T')[0],
      items: [{
        description: "Store Purchase",
        amount: "0.00",
        category: "Other",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }]
    };
  }
}
