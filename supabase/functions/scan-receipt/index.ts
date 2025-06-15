
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runOCR } from "./services/ocrService.ts";

console.log("=== scan-receipt function loaded ===");

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
    
    // Check content type
    const contentType = req.headers.get('content-type') || '';
    console.log("Content-Type:", contentType);
    
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
    
    // Processing level from header
    const processingLevel = req.headers.get('X-Processing-Level') || 'standard';
    const enhancedProcessing = processingLevel === 'high';
    console.log("Processing level:", processingLevel, "Enhanced:", enhancedProcessing);
    
    let receiptImage: File | null = null;
    
    // Check if this is multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      console.log("Handling multipart form data");
      
      try {
        // Parse the form data
        const formData = await req.formData();
        const formDataKeys = [...formData.keys()];
        console.log("Form data keys:", formDataKeys);
        
        // Try all common field names for the receipt file
        const fieldNamesToCheck = ['file', 'receipt', 'image', 'receiptImage'];
        
        for (const fieldName of fieldNamesToCheck) {
          const file = formData.get(fieldName) as File;
          if (file && file instanceof File && file.size > 0) {
            receiptImage = file;
            console.log(`Found receipt image in field '${fieldName}': ${file.name} (${file.size} bytes, type: ${file.type})`);
            break;
          }
        }
        
        if (!receiptImage) {
          console.error("No receipt image found in form data");
          console.error("Available form fields:", formDataKeys);
          
          return new Response(JSON.stringify({
            error: 'No receipt image provided',
            formDataKeys: formDataKeys,
            fieldNamesChecked: fieldNamesToCheck,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Validate file type
        if (!receiptImage.type.startsWith('image/')) {
          console.error(`Invalid file type: ${receiptImage.type}`);
          return new Response(JSON.stringify({
            error: 'Invalid file type. Please upload an image.',
            fileType: receiptImage.type,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Validate file size (max 10MB)
        if (receiptImage.size > 10 * 1024 * 1024) {
          console.error(`File too large: ${receiptImage.size} bytes`);
          return new Response(JSON.stringify({
            error: 'File too large. Maximum size is 10MB.',
            fileSize: receiptImage.size,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log(`Processing ${receiptImage.name} (${receiptImage.size} bytes, type: ${receiptImage.type})`);

        try {
          // Race between processing and timeout
          const timeoutDuration = 28000; // 28 seconds
          console.log(`Setting timeout for OCR processing: ${timeoutDuration}ms`);
          
          const results = await Promise.race([
            runOCR(receiptImage, openaiApiKey),
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
              filename: receiptImage.name,
              size: receiptImage.size,
              type: receiptImage.type
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
      } catch (formDataError) {
        console.error("Error parsing form data:", formDataError);
        return new Response(JSON.stringify({
          error: 'Failed to parse form data',
          details: formDataError.message,
          contentType: contentType,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.error("Unsupported content type:", contentType);
      return new Response(JSON.stringify({
        error: 'Unsupported content type',
        expected: 'multipart/form-data',
        received: contentType,
      }), {
        status: 400,
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
