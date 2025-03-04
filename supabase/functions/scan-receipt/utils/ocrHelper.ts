
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

  // Log OCR API key status
  console.log(`OCR API key status: ${apiKey ? 'present' : 'missing'}`);

  try {
    // Send image to OCR API
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey || '',
      },
      body: ocrFormData,
    });

    console.log(`OCR API response status: ${ocrResponse.status}`);
    const ocrData = await ocrResponse.json();
    console.log("OCR API response data:", JSON.stringify(ocrData).substring(0, 200) + "...");

    if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      console.error("No parsed results from OCR");
      return { success: false, error: "No parsed results from OCR" };
    }

    const extractedText = ocrData.ParsedResults[0].ParsedText;
    console.log("Extracted text:", extractedText);

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
  return {
    storeName: "Joe's Diner",
    date: "2024-04-05",
    items: [
      { name: "Burger", amount: "10.00", category: "Shopping" },
      { name: "Salad", amount: "8.00", category: "Shopping" },
      { name: "Soft Drink (2)", amount: "6.00", category: "Shopping" },
      { name: "Pie", amount: "7.00", category: "Shopping" }
    ],
    total: "31.00",
    paymentMethod: "Credit Card",
  };
}
