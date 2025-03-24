
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
          success: false, 
          error: "No receipt image provided",
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Received image: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`)
    
    // Get the receipt URL if provided (for Supabase storage images)
    const receiptUrl = formData.get('receiptUrl')
    
    // Process the receipt image with either Google Vision or a fallback approach
    const startTime = performance.now()
    const result = await processReceipt(receiptImage);
    const processingTime = (performance.now() - startTime).toFixed(2)
    console.log(`Receipt processing completed in ${processingTime}ms`)
    
    // Add receipt URL to result if provided
    if (receiptUrl && typeof receiptUrl === 'string') {
      result.receiptUrl = receiptUrl;
    }
    
    return new Response(
      JSON.stringify({
        ...result,
        processingTime: `${processingTime}ms`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing receipt:", error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process receipt: ' + (error.message || "Unknown error"),
        items: generateFallbackData() // Return fallback data so front-end can still work
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Import from data module
import { generateFallbackData } from "./data/fallbackData.ts";
