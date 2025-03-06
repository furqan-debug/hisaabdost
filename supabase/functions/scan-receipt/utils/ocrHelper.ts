
import { parseReceiptData } from "./parseReceipt.ts";

// Default CORS headers for edge function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process receipt with OCR
export async function processReceiptWithOCR(receiptImage: File, apiKey: string | null) {
  console.log(`Processing receipt: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`);

  // Create form data for OCR API
  const ocrFormData = new FormData();
  ocrFormData.append('language', 'eng');
  ocrFormData.append('isOverlayRequired', 'false');
  ocrFormData.append('file', receiptImage);
  ocrFormData.append('detectOrientation', 'true');
  ocrFormData.append('scale', 'true');
  ocrFormData.append('isTable', 'true'); // Better for receipt table structure
  ocrFormData.append('OCREngine', '2'); // More accurate OCR engine

  // Log OCR API key status
  console.log(`OCR API key status: ${apiKey ? 'present' : 'missing'}`);

  try {
    // Check if we have an API key before proceeding
    if (!apiKey) {
      console.warn("No OCR API key provided, using fallback data");
      return { success: false, error: "OCR API key not configured" };
    }

    // Send image to OCR API with retry logic
    let attempts = 0;
    const maxAttempts = 2;
    let ocrResponse;
    let ocrData;

    while (attempts < maxAttempts) {
      try {
        ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': apiKey,
          },
          body: ocrFormData,
        });

        console.log(`OCR API response status: ${ocrResponse.status}`);
        ocrData = await ocrResponse.json();
        
        // Check if we got a successful response
        if (ocrResponse.status === 200 && ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
          break; // Success, exit retry loop
        }
        
        // If unsuccessful, increment attempt counter and retry
        attempts++;
        console.warn(`OCR attempt ${attempts} failed, ${maxAttempts - attempts} attempts remaining`);
      } catch (error) {
        console.error(`OCR attempt ${attempts} error:`, error);
        attempts++;
      }
    }

    // If we have no data after all attempts, return error
    if (!ocrData || !ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      console.error("No parsed results from OCR after multiple attempts");
      return { success: false, error: "Failed to extract text from image" };
    }

    // Log a sample of the extracted text for debugging
    const extractedText = ocrData.ParsedResults[0].ParsedText;
    console.log("Extracted text sample:", extractedText.substring(0, 200) + (extractedText.length > 200 ? "..." : ""));

    // Parse receipt data from extracted text
    const receiptData = parseReceiptData(extractedText);
    console.log("Extracted receipt data:", receiptData);

    return { success: true, receiptData };
  } catch (error) {
    console.error("OCR API error:", error);
    return { success: false, error: error.message || "OCR processing failed" };
  }
}

// Generate fallback receipt data if OCR fails
export function generateFallbackReceiptData() {
  // Use today's date for the fallback data
  const today = new Date().toISOString().split('T')[0];
  
  return {
    storeName: "Receipt Scan",
    date: today,
    items: [
      { name: "Item 1", amount: "15.99", category: "Shopping" },
      { name: "Item 2", amount: "9.99", category: "Shopping" },
      { name: "Item 3", amount: "12.50", category: "Shopping" }
    ],
    total: "38.48",
    paymentMethod: "Card",
  };
}
