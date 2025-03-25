
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processReceipt } from "./services/receiptProcessor.ts"
import { parseReceiptText } from "./utils/textParser.ts"

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    console.log(`Processing receipt scan request: ${req.method}`)
    
    // Check if it's a POST request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Make sure we have a multipart form data request
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse the multipart form data
    const formData = await req.formData()
    const receiptFile = formData.get('receipt')
    
    if (!receiptFile || !(receiptFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No receipt file provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Processing receipt file: ${receiptFile.name}, size: ${receiptFile.size} bytes, type: ${receiptFile.type}`)
    
    // Check if enhanced processing is requested
    const enhancedProcessing = formData.get('enhanced') === 'true'
    
    // Process the receipt with OCR
    console.log(`Starting receipt processing with ${enhancedProcessing ? 'enhanced' : 'standard'} settings`)
    const processingResult = await processReceipt(receiptFile, enhancedProcessing)
    
    console.log("Processing completed, result:", processingResult.success ? "Success" : "Failed")
    
    // Set a timeout for simulating long-running operations
    const processingTime = receiptFile.size > 2000000 ? 3000 : 1000
    
    // Only add artificial delay in development
    if (Deno.env.get('DENO_ENV') === 'development') {
      await new Promise(resolve => setTimeout(resolve, processingTime))
    }
    
    // Return the processed data
    return new Response(
      JSON.stringify(processingResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error("Error processing receipt:", error)
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while processing the receipt",
        success: false,
        isTimeout: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
