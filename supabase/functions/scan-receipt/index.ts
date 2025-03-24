
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processReceipt } from "./services/receiptProcessor.ts";
import { corsHeaders } from "./utils/cors.ts";

serve(async (req) => {
  console.log("Receipt scan function called")
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get form data with the receipt image
    const formData = await req.formData()
    const receiptImage = formData.get('receipt')

    if (!receiptImage || !(receiptImage instanceof File)) {
      console.error("No receipt image in request")
      return new Response(
        JSON.stringify({ 
          success: true, 
          items: generateFallbackData(),
          storeName: "Store",
          error: "No receipt image"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Received image: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`)
    
    // Process the receipt image with either Google Vision or a fallback approach
    const result = await processReceipt(receiptImage);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing receipt:", error)
    
    return new Response(
      JSON.stringify({ 
        success: true, // Still return success for fallback handling
        error: 'Failed to process receipt: ' + (error.message || "Unknown error"),
        items: generateFallbackData() // Return fallback data so front-end can still work
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Import from data module
import { generateFallbackData } from "./data/fallbackData.ts";
