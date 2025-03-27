
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processReceipt } from "./services/receiptProcessor.ts";
import { runOCR } from "./services/ocrService.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Processing-Level',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Create a timeout promise for long-running operations
function createTimeout(timeoutMs = 28000) {
  return new Promise<{ isTimeout: true }>((resolve) => {
    setTimeout(() => resolve({ isTimeout: true }), timeoutMs);
  });
}

serve(async (req) => {
  console.log("Receipt scanning function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    console.error(`Invalid method: ${req.method}`);
    return new Response(JSON.stringify({
      error: 'Method not allowed',
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    console.log("Starting receipt scanning process");
    // Check if this is a browser-friendly format
    const contentType = req.headers.get('content-type') || '';
    
    // OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error("OpenAI API key not found");
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Processing level from header (standard or enhanced)
    const processingLevel = req.headers.get('X-Processing-Level') || 'standard';
    const enhancedProcessing = processingLevel === 'high';
    
    let receiptImage: File | null = null;
    
    if (contentType.includes('multipart/form-data')) {
      console.log("Handling multipart form data");
      const formData = await req.formData();
      receiptImage = formData.get('receipt') as File;
      
      if (!receiptImage) {
        console.error("No receipt image found in form data");
        return new Response(JSON.stringify({
          error: 'No receipt image provided',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`Processing ${receiptImage.name} (${receiptImage.size} bytes)`);

      try {
        // Race between processing and timeout
        const results = await Promise.race([
          runOCR(receiptImage, openaiApiKey),
          createTimeout(28000) // 28 second timeout (Edge Function has 30s limit)
        ]);
        
        // Check if this was a timeout
        if ('isTimeout' in results) {
          console.log("OCR processing timed out");
          return new Response(JSON.stringify({
            isTimeout: true,
            warning: "Processing timed out, partial results returned",
            date: new Date().toISOString().split('T')[0]
          }), {
            status: 200, // Return 200 with timeout indication rather than error
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Return the processed results
        console.log("OCR processing completed successfully");
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Error processing receipt:", error);
        return new Response(JSON.stringify({
          error: 'Receipt processing failed',
          details: error.message,
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Handle direct JSON requests for testing
      console.error("Unsupported content type:", contentType);
      return new Response(JSON.stringify({
        error: 'Unsupported content type',
        expected: 'multipart/form-data',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
