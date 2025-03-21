
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, processReceiptWithOCR, generateFallbackReceiptData } from "./utils/ocrHelper.ts"

// Get Google Vision API key from environment variable
const VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY')

serve(async (req) => {
  console.log("Receipt scan function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get form data with the receipt image
    const formData = await req.formData()
    const receiptImage = formData.get('receipt')

    if (!receiptImage || !(receiptImage instanceof File)) {
      console.error("No receipt image in request");
      return new Response(
        JSON.stringify({ success: false, error: 'No receipt image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Received image: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`);

    // Check if Vision API key is configured
    if (!VISION_API_KEY) {
      console.error("No Google Vision API key configured");
      // Instead of returning an error, use the fallback data
      console.log("Using fallback receipt data generation since no API key is configured");
      const fallbackData = generateFallbackReceiptData();
      return new Response(
        JSON.stringify({ 
          success: true, 
          receiptData: fallbackData,
          isFromFallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Process receipt with Google Vision API
    try {
      const result = await processReceiptWithOCR(receiptImage, VISION_API_KEY);
      
      if (result.success) {
        return new Response(
          JSON.stringify({ success: true, receiptData: result.receiptData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.error("Google Vision API processing failed:", result.error);
        
        // If Vision API processing failed, use fallback data
        console.log("Using fallback receipt data generation due to Vision API processing failure");
        const fallbackData = generateFallbackReceiptData();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            receiptData: fallbackData,
            isFromFallback: true,
            error: result.error,
            details: "Using generated sample data since Vision API processing failed."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (ocrError) {
      console.error("Vision API processing error:", ocrError);
      
      // If Vision API fails completely, use fallback data
      console.log("Using fallback receipt data generation due to Vision API error");
      const fallbackData = generateFallbackReceiptData();
      
      // Return success with fallback data, but include error information
      return new Response(
        JSON.stringify({ 
          success: true, 
          receiptData: fallbackData,
          isFromFallback: true,
          error: "Vision API error: " + (ocrError.message || "Unknown error"),
          details: "Using generated sample data since the OCR service is unavailable."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error("Error processing receipt:", error);
    
    // For any other unexpected errors, also use fallback data
    console.log("Using fallback receipt data due to unexpected error");
    const fallbackData = generateFallbackReceiptData();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        receiptData: fallbackData,
        isFromFallback: true,
        error: 'Unexpected error: ' + (error.message || "Unknown error"),
        details: "Using generated sample data due to an unexpected error."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
