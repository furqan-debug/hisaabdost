
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processReceipt } from "./services/receiptProcessor.ts";
import { runOCR } from "./services/ocrService.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    
    // Check content type
    const contentType = req.headers.get('content-type') || '';
    console.log("Content-Type:", contentType);
    
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
    let formDataFields: string[] = [];
    
    // Check if this is multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      console.log("Handling multipart form data");
      
      try {
        // Parse the form data
        const formData = await req.formData();
        formDataFields = [...formData.keys()];
        console.log("Form data keys:", formDataFields);
        
        // Try all common field names for the receipt file
        const fieldNamesToCheck = ['receipt', 'image', 'file', 'receiptImage'];
        
        for (const fieldName of fieldNamesToCheck) {
          const file = formData.get(fieldName) as File;
          if (file && file instanceof File && file.size > 0) {
            receiptImage = file;
            console.log(`Found receipt image in field '${fieldName}': ${file.name} (${file.size} bytes, type: ${file.type})`);
            break;
          } else if (formData.has(fieldName)) {
            console.log(`Field '${fieldName}' exists but is not a valid file or is empty`);
          }
        }
        
        if (!receiptImage) {
          console.error("No receipt image found in form data");
          
          // Create a more detailed error response with debug info
          const formDataEntries = Object.fromEntries(
            [...formData.entries()].map(([key, value]) => {
              if (value instanceof File) {
                return [key, `File: ${value.name} (${value.size} bytes, ${value.type})`];
              }
              return [key, typeof value === 'string' ? value.substring(0, 100) : 'Non-string value'];
            })
          );
          
          return new Response(JSON.stringify({
            error: 'No receipt image provided',
            formDataKeys: formDataFields,
            formDataEntries,
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

          // Supabase integration: Insert expenses into database if credentials are available
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

          if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Supabase credentials missing");
          } else {
            try {
              const supabase = createClient(supabaseUrl, supabaseAnonKey);
              if (results.items && results.items.length > 0) {
                console.log(`Attempting to insert ${results.items.length} expenses into Supabase`);
                
                // Validate and format items before inserting
                const validItems = results.items.filter(item => 
                  item && typeof item.amount !== 'undefined' && 
                  !isNaN(parseFloat(item.amount.toString()))
                ).map(item => ({
                  ...item,
                  amount: parseFloat(item.amount.toString()),
                  created_at: new Date().toISOString(),
                  receipt_url: item.receiptUrl || null,
                }));
                
                if (validItems.length > 0) {
                  const { data, error } = await supabase.from('expenses').insert(validItems);
                  
                  if (error) {
                    console.error("Failed to insert expenses into Supabase:", error);
                  } else {
                    console.log(`Successfully inserted ${validItems.length} expenses`);
                  }
                } else {
                  console.warn("No valid items to insert after filtering");
                }
              } else {
                console.log("No items to insert into Supabase");
              }
            } catch (dbError) {
              console.error("Error during Supabase database operation:", dbError);
            }
          }

          // Return the processed results
          console.log("OCR processing completed successfully");
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
