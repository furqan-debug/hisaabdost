
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
    if (!file || file.size === 0) {
      throw new Error("Invalid file: File is empty or undefined");
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = bufferToBase64(arrayBuffer);

    console.log(`Processing receipt image with OpenAI: ${file.name} (${file.size} bytes)`);

    const prompt = `You are an expert receipt analyzer. Extract the following information from this receipt image and return it in the exact JSON format shown below.

Extract:
1. Store/merchant name
2. Purchase date (format: YYYY-MM-DD)
3. Individual items with their prices
4. Total amount

Return ONLY valid JSON in this exact format:
{
  "date": "YYYY-MM-DD",
  "merchant": "Store Name",
  "items": [
    {
      "description": "item name",
      "amount": "0.00",
      "category": "Food"
    }
  ],
  "total": "0.00"
}

Categories must be one of: Food, Rent, Utilities, Transportation, Entertainment, Shopping, Other

If you cannot read the receipt clearly, return:
{
  "success": false,
  "error": "Could not process receipt image"
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
      max_tokens: 1500,
      temperature: 0.1
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    if (!content) {
      throw new Error("No content received from OpenAI API");
    }

    console.log("OpenAI raw response:", content.substring(0, 500) + "...");

    // Try to extract JSON from the response
    let jsonString = content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      jsonString = jsonMatch[1] || jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.error("Raw content:", content);
      throw new Error("OpenAI returned invalid JSON format");
    }

    // Check if OpenAI indicated it couldn't process the image
    if (parsed.success === false) {
      throw new Error(parsed.error || "OpenAI could not process the receipt clearly");
    }

    // Validate and normalize the response
    if (!parsed.items || !Array.isArray(parsed.items)) {
      parsed.items = [];
    }

    // If no items were found, create a fallback item
    if (parsed.items.length === 0) {
      parsed.items = [{
        description: parsed.merchant || "Store Purchase",
        amount: parsed.total || "0.00",
        category: "Other",
        date: parsed.date || new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }];
    } else {
      // Normalize existing items
      parsed.items = parsed.items.map((item: any) => ({
        ...item,
        category: normalizeCategory(item.category || "Other"),
        amount: parseFloat(item.amount || "0").toFixed(2),
        date: parsed.date || new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }));
    }

    console.log(`✅ Successfully processed receipt with ${parsed.items.length} items`);
    
    return {
      ...parsed,
      success: true
    };

  } catch (error) {
    console.error("OpenAI processing failed:", error);
    
    // Return a structured error response instead of throwing
    return {
      success: false,
      error: error.message || "Failed to process receipt image",
      items: [],
      date: new Date().toISOString().split('T')[0],
      merchant: "Store",
      total: "0.00"
    };
  }
}
