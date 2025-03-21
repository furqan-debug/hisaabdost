
import { parseReceiptData } from "./parseReceipt.ts";
import { extractDate } from "./dateUtils.ts";

// Default CORS headers for edge function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process receipt with Google Cloud Vision API - simplified
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
              type: "TEXT_DETECTION",
              // Set maxResults higher to capture more text
              maxResults: 100
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
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
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
    
    // Ensure we have a valid date
    if (!receiptData.date || receiptData.date === "Invalid Date") {
      receiptData.date = new Date().toISOString().split('T')[0];
    }
    
    // Ensure we have a valid total
    if (!receiptData.total || parseFloat(receiptData.total) <= 0) {
      // Calculate total from items if available
      if (receiptData.items && receiptData.items.length > 0) {
        const calculatedTotal = receiptData.items.reduce((sum, item) => {
          const amount = parseFloat(item.amount);
          return isNaN(amount) ? sum : sum + amount;
        }, 0).toFixed(2);
        
        receiptData.total = calculatedTotal;
      } else {
        receiptData.total = "0.00";
      }
    }
    
    // Validate and clean up items
    if (receiptData.items && receiptData.items.length > 0) {
      // Filter out any items with invalid amounts
      receiptData.items = receiptData.items.filter(item => {
        const amount = parseFloat(item.amount);
        return !isNaN(amount) && amount > 0 && item.name.length > 2;
      });
      
      // Clean up item names and capitalize first letters
      receiptData.items = receiptData.items.map(item => ({
        ...item,
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()
      }));
    }
    
    console.log("Final extracted receipt data:", receiptData);

    return { success: true, receiptData };
  } catch (error) {
    console.error("Google Vision API error:", error);
    return { success: false, error: error.message || "Vision API processing failed" };
  }
}

// Generate fallback receipt data with sample items
export function generateFallbackReceiptData() {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    storeName: "Supermarket",
    date: today,
    items: [
      { name: "Milk", amount: "1.99", category: "Groceries" },
      { name: "Bread", amount: "2.49", category: "Groceries" },
      { name: "Eggs", amount: "3.99", category: "Groceries" },
      { name: "Cheese", amount: "4.59", category: "Groceries" },
      { name: "Apples", amount: "3.29", category: "Groceries" }
    ],
    total: "16.35",
    paymentMethod: "Card",
  };
}
