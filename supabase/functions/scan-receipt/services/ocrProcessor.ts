
import { extractDate } from "../utils/dateExtractor.ts";

// Process receipt with OpenAI Vision API using GPT-4o
export async function processReceiptWithOCR(receiptImage: File, apiKey: string) {
  console.log("Processing receipt with OpenAI GPT-4o Vision API");

  try {
    // Convert image to base64
    const arrayBuffer = await receiptImage.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Image = btoa(String.fromCharCode(...uint8Array));

    // Get OpenAI API key
    const OPENAI_API_KEY = apiKey || Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not found");
      return { success: false, error: "Missing API key" };
    }

    // System Prompt optimized for receipt extraction
    const systemPrompt = `
You are an expert in receipt data extraction. Extract:
1. **Date of Purchase** (YYYY-MM-DD)
2. **Merchant/Store name**
3. **Total amount**
4. **Each item purchased**, including:
   - Item name/description
   - Item price (numeric only)
   - Auto-categorized item type (Food, Rent, Utilities, Transportation, Entertainment, Shopping, or Other)
   
### **JSON format:**
{
  "date": "YYYY-MM-DD",
  "merchant": "Store Name",
  "total": "XX.XX",
  "items": [
    { "description": "Item 1", "amount": "X.XX", "category": "Food" },
    { "description": "Item 2", "amount": "X.XX", "category": "Transportation" }
  ]
}
Ensure the output is **valid JSON** with no other text.
`;

    // Request body for OpenAI API - using GPT-4o model
    const requestBody = {
      model: "gpt-4o", // Using GPT-4o for vision capabilities
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all details from this receipt image:" },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}` 
              } 
            }
          ]
        }
      ],
      max_tokens: 1500
    };

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      console.error("Error details:", errorText);
      return { success: false, error: "OpenAI API failed" };
    }

    // Parse response
    const responseData = await response.json();
    const extractedText = responseData.choices?.[0]?.message?.content;

    if (!extractedText) {
      console.error("No valid response from OpenAI");
      return { success: false, error: "No data extracted" };
    }

    console.log("Raw GPT-4o response:", extractedText);

    // Improved JSON parsing with error handling
    let extractedData;
    try {
      // Check if response is wrapped in code blocks and extract just the JSON
      let jsonText = extractedText;
      
      // Remove markdown code blocks if present
      const jsonMatch = extractedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1].trim();
      } else {
        // Try to find JSON structure if not in code blocks
        const jsonObjectMatch = extractedText.match(/{[\s\S]*}/);
        if (jsonObjectMatch) {
          jsonText = jsonObjectMatch[0];
        }
      }
      
      console.log("Extracted JSON text:", jsonText);
      extractedData = JSON.parse(jsonText);
      
      // Validate data structure
      if (!extractedData.items || !Array.isArray(extractedData.items)) {
        extractedData.items = [];
      }
      
      // Normalize items format
      extractedData.items = extractedData.items.map(item => ({
        description: item.description || item.name || "Unknown Item",
        amount: typeof item.amount === 'string' ? item.amount : 
                typeof item.amount === 'number' ? item.amount.toFixed(2) : 
                typeof item.price === 'string' ? item.price : 
                typeof item.price === 'number' ? item.price.toFixed(2) : "0.00",
        category: item.category || "Other",
        date: extractedData.date || new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }));
      
      console.log("Successfully parsed response:", extractedData);
      
      // Ensure all required fields exist
      if (!extractedData.merchant) {
        extractedData.merchant = "Unknown Store";
      }
      
      if (!extractedData.total) {
        // Calculate total from items if not provided
        const sum = extractedData.items.reduce((acc, item) => {
          const amount = parseFloat(item.amount) || 0;
          return acc + amount;
        }, 0);
        extractedData.total = sum.toFixed(2);
      }
      
      if (!extractedData.date) {
        extractedData.date = new Date().toISOString().split('T')[0];
      }
      
    } catch (err) {
      console.error("Invalid JSON response from OpenAI:", err);
      console.log("Attempting to extract data from non-JSON response...");
      
      // Try extracting structured data even from invalid JSON
      const itemsRegex = /name":\s*"([^"]+)",\s*"amount":\s*([\d.]+)/g;
      const dateRegex = /"date":\s*"([^"]+)"/;
      const merchantRegex = /"merchant":\s*"([^"]+)"/;
      const totalRegex = /"total":\s*"?(\d+\.?\d*)"/;
      
      const items = [];
      let match;
      while ((match = itemsRegex.exec(extractedText)) !== null) {
        items.push({
          description: match[1],
          amount: parseFloat(match[2]).toFixed(2),
          category: "Other",
          date: new Date().toISOString().split('T')[0],
          paymentMethod: "Card"
        });
      }
      
      let date = new Date().toISOString().split('T')[0];
      const dateMatch = dateRegex.exec(extractedText);
      if (dateMatch) {
        date = dateMatch[1];
      }
      
      let merchant = "Unknown Store";
      const merchantMatch = merchantRegex.exec(extractedText);
      if (merchantMatch) {
        merchant = merchantMatch[1];
      }
      
      let total = "0.00";
      const totalMatch = totalRegex.exec(extractedText);
      if (totalMatch) {
        total = totalMatch[1];
      }
      
      extractedData = {
        date,
        merchant,
        total,
        items: items.length > 0 ? items : [
          {
            description: "Receipt Item",
            amount: total,
            category: "Other",
            date,
            paymentMethod: "Card"
          }
        ]
      };
      
      console.log("Reconstructed data from partial matches:", extractedData);
    }

    return { ...extractedData, success: true };
    
  } catch (error) {
    console.error("Error processing receipt:", error);
    return { 
      success: false, 
      error: "Unexpected error",
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
