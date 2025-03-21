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

    // Simple check for very large images
    if (receiptImage.size > 8 * 1024 * 1024) {
      console.log("Image too large, using fallback data");
      const fallbackData = generateFallbackReceiptData();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          receiptData: fallbackData,
          note: "Using fallback data as image is too large" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set a timeout - don't hang the function for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    
    try {
      // Process receipt with Google Vision API
      const result = await Promise.race([
        processReceiptWithOCR(receiptImage, VISION_API_KEY),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OCR processing timeout")), 15000)
        )
      ]);
      
      clearTimeout(timeoutId);
      
      if (result.success) {
        return new Response(
          JSON.stringify({ success: true, receiptData: result.receiptData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.log("Google Vision API failed:", result.error);
        // Only use fallback data if there's no Vision API key configured
        if (!VISION_API_KEY) {
          const fallbackData = generateFallbackReceiptData();
          return new Response(
            JSON.stringify({ 
              success: true, 
              receiptData: fallbackData,
              note: "Using fallback data as no Vision API key is configured" 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Otherwise return the error
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error || "Failed to extract data from receipt" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (ocrError) {
      console.error("Vision API processing error or timeout:", ocrError);
      
      // Return an error instead of fallback data
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Receipt scanning failed: " + (ocrError.message || "timeout"),
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
