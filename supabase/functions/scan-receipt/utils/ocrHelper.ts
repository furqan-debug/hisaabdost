
import { parseReceiptData } from "./parseReceipt.ts";
import { extractDate } from "./dateUtils.ts";

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
  
  // If the image is from a camera capture, it might be larger, so we enable additional options
  if (receiptImage.name.includes('capture') || receiptImage.name.includes('image')) {
    ocrFormData.append('filetype', 'jpg');
    ocrFormData.append('detectOrientation', 'true');
    ocrFormData.append('scale', 'true');
    ocrFormData.append('isCreateSearchablePdf', 'false');
  }

  // Log OCR API key status
  console.log(`OCR API key status: ${apiKey ? 'present' : 'missing'}`);

  try {
    // Check if we have an API key before proceeding
    if (!apiKey) {
      console.warn("No OCR API key provided, using fallback data");
      return { success: false, error: "OCR API key not configured" };
    }

    // Send image to OCR API with improved retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let ocrResponse;
    let ocrData;

    while (attempts < maxAttempts) {
      try {
        console.log(`OCR attempt ${attempts + 1} of ${maxAttempts}`);
        
        // Set a timeout for the fetch operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': apiKey,
          },
          body: ocrFormData,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        console.log(`OCR API response status: ${ocrResponse.status}`);
        
        if (!ocrResponse.ok) {
          throw new Error(`OCR API returned status ${ocrResponse.status}`);
        }
        
        ocrData = await ocrResponse.json();
        
        // Check if we got a successful response with parsed results
        if (ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
          break; // Success, exit retry loop
        } else {
          throw new Error("No parsed results in OCR response");
        }
      } catch (error) {
        console.error(`OCR attempt ${attempts + 1} error:`, error);
        
        // If we've reached max attempts, exit the loop
        if (attempts + 1 >= maxAttempts) {
          console.error("Max OCR attempts reached, giving up");
          break;
        }
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
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

    // Split into lines for better processing
    const textLines = extractedText.split('\n').filter(line => line.trim().length > 0);
    
    // Extract date specifically using our enhanced date extractor
    const extractedDate = extractDate(textLines);
    console.log("Extracted date:", extractedDate);

    // Parse receipt data from extracted text
    const receiptData = parseReceiptData(extractedText);
    
    // Ensure the date is included
    if (extractedDate && (!receiptData.date || receiptData.date === "Invalid Date")) {
      receiptData.date = extractedDate;
    }
    
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
