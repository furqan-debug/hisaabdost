import { extractDate } from "../utils/dateExtractor.ts";

// Process receipt with OpenAI Vision API
export async function processReceiptWithOCR(receiptImage: File, apiKey: string) {
  console.log("Processing receipt with OpenAI Vision API");

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

    // System Prompt
    const systemPrompt = `
You are an expert in receipt data extraction. Extract:
1. **Date of Purchase** (YYYY-MM-DD)
2. **Each item purchased**, including:
   - Item name
   - Item price (numeric only)
   - Auto-categorized item type (e.g., food, transport, grocery)
   
Ignore store name, taxes, discounts, payment method, and subtotal.

### **JSON format:**
\`\`\`json
{
  "date": "YYYY-MM-DD",
  "items": [
    { "name": "Item 1", "amount": X.XX, "category": "food" },
    { "name": "Item 2", "amount": X.XX, "category": "transport" }
  ]
}
\`\`\`
Ensure the output is **valid JSON**.
`;

    // Request body for OpenAI API
    const requestBody = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all details from this receipt image:" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ]
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

    // Ensure valid JSON parsing
    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (err) {
      console.error("Invalid JSON response from OpenAI:", extractedText);
      return { success: false, error: "Invalid JSON from OpenAI" };
    }

    return { ...extractedData, success: true };
    
  } catch (error) {
    console.error("Error processing receipt:", error);
    return { success: false, error: "Unexpected error" };
  }
}
