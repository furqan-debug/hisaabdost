
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Enhanced OCR mock function with more realistic data
async function runOCR(file: File): Promise<any> {
  console.log(`Edge Function: Running OCR on file: ${file.name}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response with more realistic receipt data
  const sampleReceipts = [
    {
      success: true,
      date: new Date().toISOString().split('T')[0],
      merchant: "Grocery Store",
      total: "45.67",
      items: [
        {
          description: "Milk",
          amount: "4.99",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Bread",
          amount: "2.50",
          category: "Food", 
          paymentMethod: "Card"
        },
        {
          description: "Eggs",
          amount: "6.99",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Cheese",
          amount: "8.99",
          category: "Food",
          paymentMethod: "Card"
        }
      ]
    },
    {
      success: true,
      date: new Date().toISOString().split('T')[0],
      merchant: "Coffee Shop",
      total: "12.45",
      items: [
        {
          description: "Latte",
          amount: "5.95",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Muffin",
          amount: "3.50",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Tip",
          amount: "3.00",
          category: "Other",
          paymentMethod: "Card"
        }
      ]
    }
  ];
  
  // Return a random sample receipt
  const receipt = sampleReceipts[Math.floor(Math.random() * sampleReceipts.length)];
  console.log("Edge Function: Generated mock receipt data:", JSON.stringify(receipt, null, 2));
  
  return receipt;
}

serve(async (req) => {
  console.log("=== Receipt scanning function called ===");
  console.log("Edge Function: Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Edge Function: Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    console.error(`Edge Function: Invalid method: ${req.method}`);
    return new Response(JSON.stringify({
      error: 'Method not allowed',
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    console.log("Edge Function: Starting receipt scanning process");
    
    // Parse the JSON body
    const requestBody = await req.json();
    console.log("Edge Function: Request body received:", {
      fileName: requestBody.fileName,
      fileType: requestBody.fileType,
      fileSize: requestBody.fileSize,
      hasFile: !!requestBody.file,
      timestamp: requestBody.timestamp
    });
    
    if (!requestBody.file || !requestBody.fileName) {
      console.error("Edge Function: No file data found in request body");
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
    
    console.log(`Edge Function: Processing ${receiptFile.name} (${receiptFile.size} bytes, type: ${receiptFile.type})`);

    // Validate file type
    if (!receiptFile.type.startsWith('image/')) {
      console.error(`Edge Function: Invalid file type: ${receiptFile.type}`);
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
      console.error(`Edge Function: File too large: ${receiptFile.size} bytes`);
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
      console.log(`Edge Function: Setting timeout for OCR processing: ${timeoutDuration}ms`);
      
      const results = await Promise.race([
        runOCR(receiptFile),
        createTimeout(timeoutDuration)
      ]);
      
      // Check if this was a timeout
      if ('isTimeout' in results) {
        console.log("Edge Function: OCR processing timed out");
        return new Response(JSON.stringify({
          isTimeout: true,
          warning: "Processing timed out, partial results returned",
          date: new Date().toISOString().split('T')[0]
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Return the processed results
      console.log("Edge Function: OCR processing completed successfully");
      console.log("Edge Function: Returning results:", JSON.stringify(results, null, 2));
      
      return new Response(JSON.stringify({
        success: true,
        date: results.date,
        merchant: results.merchant,
        total: results.total,
        items: results.items || [],
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
      console.error("Edge Function: Error processing receipt:", error);
      return new Response(JSON.stringify({
        error: 'Receipt processing failed',
        details: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Edge Function: Unhandled error in scan-receipt function:", error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
