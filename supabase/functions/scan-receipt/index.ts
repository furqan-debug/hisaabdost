
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

    // If no Vision API key is configured, use fallback data
    if (!VISION_API_KEY) {
      console.log("No Google Vision API key configured, using fallback data");
      const fallbackData = generateFallbackReceiptData();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          receiptData: fallbackData,
          note: "Using fallback data as no Google Vision API key is configured" 
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
        console.log("Google Vision API processing failed:", result.error);
        // Return the error
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error || "Failed to extract data from receipt" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (ocrError) {
      console.error("Vision API processing error:", ocrError);
      
      // Return an error instead of fallback data
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Receipt scanning failed: " + (ocrError.message || "processing error"),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error("Error processing receipt:", error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process receipt', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
