
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
          isTimeout: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing receipt: ${receiptImage.name}, type: ${receiptImage.type}, size: ${receiptImage.size} bytes`)
    
    // Get the receipt URL if provided
    const receiptUrl = formData.get('receiptUrl')
    
    // Set processing level to high for better accuracy
    const processingLevel = 'high';
    console.log(`Using processing level: ${processingLevel}`);
    
    // Set timeout for the request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), 45000);
    });
    
    // Process the receipt image with enhanced processing
    const processingPromise = (async () => {
      const startTime = performance.now()
      const result = await processReceipt(receiptImage, true);
      const processingTime = (performance.now() - startTime).toFixed(2)
      console.log(`Receipt processing completed in ${processingTime}ms`)
      
      // Add receipt URL to result if provided
      if (receiptUrl && typeof receiptUrl === 'string') {
        result.receiptUrl = receiptUrl;
      }
      
      return new Response(
        JSON.stringify({
          ...result,
          processingTime: `${processingTime}ms`,
          isTimeout: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    })();
    
    // Race the processing against the timeout
    return await Promise.race([processingPromise, timeoutPromise]);
    
  } catch (error) {
    console.error("Error processing receipt:", error)
    
    // Determine if it's a timeout error
    const isTimeout = error.message === 'Processing timeout';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: isTimeout ? 'Receipt processing timed out. Please try again with a clearer image.' : 
          'Failed to process receipt: ' + (error.message || "Unknown error"),
        isTimeout: isTimeout,
        items: generateFallbackData() // Return fallback data so front-end can still work
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isTimeout ? 408 : 500
      }
    )
  }
})

// Import from data module
import { generateFallbackData } from "./data/fallbackData.ts";
