
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processReceiptWithOCR } from "./services/ocrProcessor.ts";
import { parseReceiptText } from "./utils/receiptParser.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Processing-Level',
};

serve(async (req) => {
  console.log("Receipt scan function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Process the multipart form data
    const formData = await req.formData();
    const receiptFile = formData.get('receipt') as File;
    
    if (!receiptFile) {
      return new Response(
        JSON.stringify({ error: "No receipt file provided" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get the processing level (if any)
    const processingLevel = req.headers.get('X-Processing-Level') || 'standard';
    const enhancedProcessing = processingLevel === 'high';
    
    // Get the API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured", 
          warning: "Limited OCR capabilities available without API key"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Process the receipt image with OCR
    const startTime = Date.now();
    const ocrResult = await processReceiptWithOCR(receiptFile, OPENAI_API_KEY, enhancedProcessing);
    const processingTime = Date.now() - startTime;
    
    // Check for timeout
    if (processingTime > 25000) {
      console.warn("Processing took too long:", processingTime, "ms");
    }
    
    // If no text was extracted, return an error
    if (!ocrResult.text) {
      return new Response(
        JSON.stringify({ 
          error: "Could not extract text from receipt", 
          isTimeout: processingTime > 25000
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Parse the extracted text to get structured data
    const receiptData = parseReceiptText(ocrResult.text);
    
    // Add the merchant name if available
    if (ocrResult.merchant && receiptData.merchant === 'Unknown') {
      receiptData.merchant = ocrResult.merchant;
    }
    
    // Add the date if available
    if (ocrResult.date && ocrResult.date !== new Date().toISOString().split('T')[0]) {
      receiptData.date = ocrResult.date;
    }
    
    // Create items array compatible with the frontend expectations
    const items = receiptData.items.map(item => ({
      description: item.name,
      amount: item.amount,
      date: receiptData.date,
      category: guessCategory(item.name),
      paymentMethod: "Card"
    }));
    
    // Include the receipt URL if it was provided
    const receiptUrl = formData.get('receiptUrl');
    if (receiptUrl && typeof receiptUrl === 'string') {
      items.forEach(item => item.receiptUrl = receiptUrl);
    }
    
    // Return the parsed receipt data
    return new Response(
      JSON.stringify({
        items,
        merchant: receiptData.merchant,
        storeName: receiptData.merchant,
        date: receiptData.date,
        total: receiptData.total,
        text: ocrResult.text,
        isTimeout: processingTime > 25000,
        processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error processing receipt:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing the receipt", 
        isTimeout: error.message?.includes('timeout')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to guess expense category from item description
function guessCategory(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('food') || 
      lowerDesc.includes('burger') || 
      lowerDesc.includes('pizza') || 
      lowerDesc.includes('restaurant') ||
      lowerDesc.includes('meal') ||
      lowerDesc.includes('cafe') ||
      lowerDesc.includes('coffee')) {
    return 'Food';
  }
  
  if (lowerDesc.includes('transport') || 
      lowerDesc.includes('uber') || 
      lowerDesc.includes('lyft') ||
      lowerDesc.includes('taxi') ||
      lowerDesc.includes('bus') ||
      lowerDesc.includes('train') ||
      lowerDesc.includes('metro')) {
    return 'Transport';
  }
  
  if (lowerDesc.includes('grocery') || 
      lowerDesc.includes('supermarket') || 
      lowerDesc.includes('market') || 
      lowerDesc.includes('food store')) {
    return 'Groceries';
  }
  
  if (lowerDesc.includes('entertain') || 
      lowerDesc.includes('movie') || 
      lowerDesc.includes('cinema') || 
      lowerDesc.includes('theatre') ||
      lowerDesc.includes('theater') ||
      lowerDesc.includes('concert')) {
    return 'Entertainment';
  }
  
  if (lowerDesc.includes('utilities') || 
      lowerDesc.includes('electricity') || 
      lowerDesc.includes('water') || 
      lowerDesc.includes('gas') ||
      lowerDesc.includes('internet') ||
      lowerDesc.includes('phone')) {
    return 'Utilities';
  }
  
  if (lowerDesc.includes('housing') || 
      lowerDesc.includes('rent') || 
      lowerDesc.includes('mortgage')) {
    return 'Housing';
  }
  
  if (lowerDesc.includes('health') || 
      lowerDesc.includes('medical') || 
      lowerDesc.includes('doctor') || 
      lowerDesc.includes('pharmacy') ||
      lowerDesc.includes('medicine')) {
    return 'Healthcare';
  }
  
  if (lowerDesc.includes('cloth') || 
      lowerDesc.includes('apparel') || 
      lowerDesc.includes('shoes') ||
      lowerDesc.includes('shirt') ||
      lowerDesc.includes('pants') ||
      lowerDesc.includes('dress')) {
    return 'Clothing';
  }
  
  return 'Other';
}
