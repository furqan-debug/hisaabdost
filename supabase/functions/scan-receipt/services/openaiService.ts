
// This service handles the communication with OpenAI's API

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

// Process the receipt with OpenAI GPT-4o (vision capabilities)
export async function processReceiptWithOpenAI(file: File, apiKey: string): Promise<any> {
  try {
    if (!file || file.size === 0) throw new Error("Invalid file");

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log(`Processing receipt image (${file.size} bytes) with GPT-4o`);
    
    // Enhanced prompt for receipt extraction using GPT-4o Vision
    const prompt = `
    Please analyze this receipt image and extract the following information in JSON format:
    1. Date of purchase (YYYY-MM-DD)
    2. Store/merchant name
    3. Total amount
    4. Each item purchased with:
       - Item description
       - Item price
       - Item category (Food, Rent, Utilities, Transportation, Entertainment, Shopping, or Other)
    
    If any information is unclear or missing, use reasonable guesses based on visible data.
    Format the response as valid JSON without any other text.
    `;

    const requestBody = {
      model: "gpt-4o", // Using GPT-4o for vision capabilities
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:${file.type};base64,${base64Image}` 
              } 
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
    console.log("Raw AI response:", content);

    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      content.match(/{[\s\S]*}/);

    let jsonString = jsonMatch?.[1] || jsonMatch?.[0] || content;
    
    // Clean up the JSON string if needed (remove markdown artifacts)
    jsonString = jsonString.replace(/^```json\s*|\s*```$/g, '').trim();
    
    console.log("Extracted JSON string:", jsonString);

    if (!jsonString) throw new Error("No JSON found in response");

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      console.error("JSON parsing error:", error);
      
      // Try to extract as much data as possible even with invalid JSON
      const dateMatch = content.match(/"date":\s*"([^"]+)"/);
      const merchantMatch = content.match(/"merchant":\s*"([^"]+)"/);
      const totalMatch = content.match(/"total":\s*"([^"]+)"/);
      
      parsed = {
        date: dateMatch?.[1] || new Date().toISOString().split('T')[0],
        merchant: merchantMatch?.[1] || "Unknown Store",
        total: totalMatch?.[1] || "0.00",
        items: []
      };
    }

    // Ensure we have the required structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      parsed.items = [{
        description: parsed.merchant || "Unknown Item",
        amount: parsed.total || "0.00",
        category: "Other",
        date: parsed.date || new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }];
    }

    // Normalize categories and ensure required fields
    parsed.items = parsed.items.map((item: any) => ({
      description: item.description || item.name || "Unknown Item",
      amount: parseFloat(item.amount || item.price || "0").toFixed(2),
      category: normalizeCategory(item.category || "Other"),
      date: parsed.date || new Date().toISOString().split('T')[0],
      paymentMethod: "Card"
    }));

    return {
      date: parsed.date || new Date().toISOString().split('T')[0],
      merchant: parsed.merchant || "Unknown Store",
      total: parsed.total ? parseFloat(parsed.total).toFixed(2) : "0.00",
      items: parsed.items
    };

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
