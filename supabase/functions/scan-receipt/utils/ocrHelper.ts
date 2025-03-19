import { parseReceiptData } from "./parseReceipt.ts";
import { extractDate } from "./dateUtils.ts";

// Default CORS headers for edge function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process receipt with Google Cloud Vision API
export async function processReceiptWithOCR(receiptImage: File, apiKey: string | null) {
  console.log(`Processing receipt with Google Vision: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`);

  // Check if we have an API key before proceeding
  if (!apiKey) {
    console.warn("No Google Vision API key provided, using fallback data");
    return { success: false, error: "Google Vision API key not configured" };
  }

  try {
    // Convert image to base64
    const arrayBuffer = await receiptImage.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Image = btoa(String.fromCharCode.apply(null, [...uint8Array]));
    
    // Prepare request for Google Cloud Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: "TEXT_DETECTION"
            }
          ],
          imageContext: {
            languageHints: ["en"]
          }
        }
      ]
    };

    console.log("Sending request to Google Vision API");
    
    // Set a timeout for the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Send request to Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }
    ).finally(() => clearTimeout(timeoutId));

    console.log(`Google Vision API response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Google Vision API returned status ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Check if we got a successful response with text annotations
    if (!responseData.responses || 
        !responseData.responses[0] || 
        !responseData.responses[0].textAnnotations || 
        responseData.responses[0].textAnnotations.length === 0) {
      console.error("No text annotations in Google Vision response");
      return { success: false, error: "Failed to extract text from image" };
    }

    // Extract the full text from the first annotation
    const extractedText = responseData.responses[0].textAnnotations[0].description;
    console.log("Extracted text sample:", extractedText.substring(0, 200) + (extractedText.length > 200 ? "..." : ""));

    // Parse receipt data from extracted text
    const receiptData = parseReceiptData(extractedText);
    
    // Extract date specifically
    const textLines = extractedText.split('\n').filter(line => line.trim().length > 0);
    const extractedDate = extractDate(textLines);
    
    // Ensure the date is included
    if (extractedDate && (!receiptData.date || receiptData.date === "Invalid Date")) {
      receiptData.date = extractedDate;
    }
    
    // If we still don't have a valid date, use today's date
    if (!receiptData.date || receiptData.date === "Invalid Date") {
      receiptData.date = new Date().toISOString().split('T')[0];
    }
    
    // Make sure we have at least one valid item
    if (!receiptData.items || receiptData.items.length === 0) {
      console.log("No valid items found, creating a default item");
      receiptData.items = [{
        name: receiptData.storeName || "Store Purchase",
        amount: receiptData.total || "0.00",
        category: "Shopping"
      }];
    }
    
    // If the total is missing, calculate it from items
    if (!receiptData.total || parseFloat(receiptData.total) <= 0) {
      const calculatedTotal = receiptData.items.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
      receiptData.total = calculatedTotal.toFixed(2);
    }
    
    console.log("Final extracted receipt data:", receiptData);

    return { success: true, receiptData };
  } catch (error) {
    console.error("Google Vision API error:", error);
    return { success: false, error: error.message || "Vision API processing failed" };
  }
}

// Generate fallback receipt data if OCR fails
export function generateFallbackReceiptData() {
  // Keep existing function implementation
  const today = new Date().toISOString().split('T')[0];
  
  return {
    storeName: "Receipt Scan",
    date: today,
    items: [
      { name: "Store Item 1", amount: "15.99", category: "Shopping" },
      { name: "Store Item 2", amount: "9.99", category: "Shopping" },
      { name: "Store Item 3", amount: "12.50", category: "Shopping" }
    ],
    total: "38.48",
    paymentMethod: "Card",
  };
}
