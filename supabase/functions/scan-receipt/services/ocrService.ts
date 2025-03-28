
// This service handles the OCR processing using OpenAI's API
import { processReceiptWithOpenAI } from "./openaiService.ts";

export async function runOCR(file: File, apiKey: string): Promise<any> {
  try {
    console.log(`Starting OCR process with ${file.name} (${file.size} bytes, type: ${file.type})`);
    
    // Validate file
    if (!file || file.size === 0) {
      throw new Error("Invalid file: File is empty or undefined");
    }
    
    if (!file.type.startsWith("image/")) {
      throw new Error(`Invalid file type: ${file.type}. Only image files are supported.`);
    }
    
    // Process the receipt image using OpenAI Vision API
    const results = await processReceiptWithOpenAI(file, apiKey);
    
    if (!results) {
      throw new Error("OCR processing failed to return results");
    }
    
    console.log("OCR processing successful");
    return results;
  } catch (error) {
    console.error("OCR failed:", error);
    throw error;
  }
}
