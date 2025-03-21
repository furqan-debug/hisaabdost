
import { parseReceiptData } from "./parseReceipt.ts";

// Default CORS headers for edge function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process receipt with Google Cloud Vision API
export async function processReceiptWithOCR(receiptImage: File, apiKey: string | null) {
  console.log(`Processing receipt with Google Vision: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`);

  // Check if we have an API key
  if (!apiKey) {
    console.warn("No Google Vision API key provided, using fallback data");
    return { 
      success: false, 
      error: "No Google Vision API key configured"
    };
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
    
    // Send request to Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log(`Google Vision API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Google Vision API error: ${response.status} ${response.statusText}`);
      // If we got a 403, the API key might be invalid
      if (response.status === 403) {
        console.error("Authentication failed - check Google Vision API key");
        return { 
          success: false, 
          error: "Google Vision API authentication failed"
        };
      }
      return { 
        success: false, 
        error: `Google Vision API returned status ${response.status}`
      };
    }
    
    const responseData = await response.json();
    
    // Check if we got a successful response with text annotations
    if (!responseData.responses || 
        !responseData.responses[0] || 
        !responseData.responses[0].textAnnotations || 
        responseData.responses[0].textAnnotations.length === 0) {
      console.error("No text annotations in Google Vision response");
      return { 
        success: false, 
        error: "No text could be extracted from the image"
      };
    }

    // Extract the full text from the first annotation
    const extractedText = responseData.responses[0].textAnnotations[0].description;
    console.log("Extracted text sample:", extractedText.substring(0, 200) + (extractedText.length > 200 ? "..." : ""));

    if (!extractedText || extractedText.trim().length < 10) {
      console.error("Extracted text is too short or empty");
      return {
        success: false,
        error: "The extracted text from the receipt is too short or empty"
      };
    }

    // Parse receipt data from extracted text
    try {
      const receiptData = parseReceiptData(extractedText);
      
      // Basic validation - make sure we have some items
      if (!receiptData.items || receiptData.items.length === 0) {
        console.error("No items found in parsed receipt data");
        return {
          success: false,
          error: "Could not identify any items on the receipt"
        };
      }
      
      console.log("Final extracted receipt data:", receiptData);
      return { success: true, receiptData };
    } catch (parseError) {
      console.error("Error parsing receipt data:", parseError);
      return {
        success: false,
        error: "Failed to parse receipt data: " + (parseError.message || "Unknown error")
      };
    }
  } catch (error) {
    console.error("Google Vision API error:", error);
    return { 
      success: false, 
      error: error.message || "Vision API processing failed" 
    };
  }
}

// Generate fallback receipt data with sample items
export function generateFallbackReceiptData() {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    storeName: "Supermarket",
    date: today,
    items: [
      { name: "Large Eggs", amount: "6.17", category: "Groceries" },
      { name: "Milk", amount: "1.80", category: "Groceries" },
      { name: "Cottage Cheese", amount: "1.64", category: "Groceries" },
      { name: "Natural Yogurt", amount: "1.20", category: "Groceries" },
      { name: "Cherry Tomatoes 1lb", amount: "3.82", category: "Groceries" },
      { name: "Bananas 1lb", amount: "0.68", category: "Groceries" },
      { name: "Aubergine", amount: "2.15", category: "Groceries" },
      { name: "Cheese Crackers", amount: "2.44", category: "Groceries" },
      { name: "Chocolate Cookies", amount: "2.29", category: "Groceries" },
      { name: "Canned Tuna 12pk", amount: "11.98", category: "Groceries" },
      { name: "Chicken Breast", amount: "6.79", category: "Groceries" },
      { name: "Toilet Paper", amount: "8.04", category: "Household" },
      { name: "Baby Wipes", amount: "2.99", category: "Household" }
    ],
    total: "52.99",
    paymentMethod: "Card",
  };
}
