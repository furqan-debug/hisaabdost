
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runOCR } from "./services/ocrService.ts";

console.log("=== scan-receipt function loaded ===");

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  console.log("=== Receipt scanning function called ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
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
    
    // OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error("OpenAI API key not found in environment");
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("OpenAI API key found");
    
    // Parse the JSON body
    const requestBody = await req.json();
    console.log("Request body received:", {
      fileName: requestBody.fileName,
      fileType: requestBody.fileType,
      fileSize: requestBody.fileSize,
      hasFile: !!requestBody.file
    });
    
    if (!requestBody.file || !requestBody.fileName) {
      console.error("No file data found in request body");
      return new Response(JSON.stringify({
        error: 'No file data provided',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Convert base64 back to File
    const base64Data = requestBody.file;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const receiptFile = new File([binaryData], requestBody.fileName, { 
      type: requestBody.fileType 
    });
    
    console.log(`Processing ${receiptFile.name} (${receiptFile.size} bytes, type: ${receiptFile.type})`);

    // Validate file type
    if (!receiptFile.type.startsWith('image/')) {
      console.error(`Invalid file type: ${receiptFile.type}`);
      return new Response(JSON.stringify({
        error: 'Invalid file type. Please upload an image.',
        fileType: receiptFile.type,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate file size (max 10MB)
    if (receiptFile.size > 10 * 1024 * 1024) {
      console.error(`File too large: ${receiptFile.size} bytes`);
      return new Response(JSON.stringify({
        error: 'File too large. Maximum size is 10MB.',
        fileSize: receiptFile.size,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Race between processing and timeout
      const timeoutDuration = 28000; // 28 seconds
      console.log(`Setting timeout for OCR processing: ${timeoutDuration}ms`);
      
      const results = await Promise.race([
        runOCR(receiptFile, openaiApiKey),
        createTimeout(timeoutDuration)
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
      console.log("Returning results:", JSON.stringify(results, null, 2));
      
      return new Response(JSON.stringify({
        ...results,
        success: true,
        receiptDetails: {
          filename: receiptFile.name,
          size: receiptFile.size,
          type: receiptFile.type
        }
      }), {
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
  } catch (error) {
    console.error("Unhandled error in scan-receipt function:", error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
    status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
