
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Google Vision API key is not configured. Please set the GOOGLE_VISION_API_KEY environment variable." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
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
        // Return the error with more specific details
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error || "Failed to extract data from receipt",
            details: "The Google Vision API was unable to process your receipt image."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (ocrError) {
      console.error("Vision API processing error:", ocrError);
      
      // Check for authentication errors specifically
      const errorMessage = ocrError.message || "Unknown error";
      if (errorMessage.includes("403") || errorMessage.includes("401") || 
          errorMessage.includes("authentication") || errorMessage.includes("forbidden")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Google Vision API authentication failed. Please check your API key and permissions.",
            details: errorMessage
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Receipt scanning failed: " + errorMessage,
          details: "There was an error processing your receipt with the OCR service."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error("Error processing receipt:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process receipt', 
        details: error.message || "Unknown error" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
