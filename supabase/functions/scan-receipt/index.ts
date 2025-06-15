
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

// Enhanced OCR mock function with more realistic receipt data
async function runOCR(file: File): Promise<any> {
  console.log(`🔍 Edge Function: Running OCR on file: ${file.name} (${file.size} bytes, ${file.type})`);
  
  // Simulate realistic processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate realistic mock receipt data based on file name or random selection
  const sampleReceipts = [
    {
      success: true,
      date: new Date().toISOString().split('T')[0],
      merchant: "Fresh Market Grocery",
      total: "28.47",
      items: [
        {
          description: "Organic Bananas",
          amount: "3.49",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Whole Grain Bread",
          amount: "4.99",
          category: "Food", 
          paymentMethod: "Card"
        },
        {
          description: "Greek Yogurt",
          amount: "5.99",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Organic Spinach",
          amount: "4.49",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Avocados (3 pack)",
          amount: "6.99",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Tax",
          amount: "2.52",
          category: "Other",
          paymentMethod: "Card"
        }
      ]
    },
    {
      success: true,
      date: new Date().toISOString().split('T')[0],
      merchant: "Corner Coffee House",
      total: "15.75",
      items: [
        {
          description: "Large Cappuccino",
          amount: "5.50",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Blueberry Muffin",
          amount: "4.25",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Tip",
          amount: "3.00",
          category: "Other",
          paymentMethod: "Card"
        },
        {
          description: "Tax",
          amount: "3.00",
          category: "Other",
          paymentMethod: "Card"
        }
      ]
    },
    {
      success: true,
      date: new Date().toISOString().split('T')[0],
      merchant: "QuickStop Gas Station",
      total: "52.30",
      items: [
        {
          description: "Regular Gas (12.5 gal)",
          amount: "45.00",
          category: "Transportation",
          paymentMethod: "Card"
        },
        {
          description: "Energy Drink",
          amount: "2.99",
          category: "Food",
          paymentMethod: "Card"
        },
        {
          description: "Snacks",
          amount: "4.31",
          category: "Food",
          paymentMethod: "Card"
        }
      ]
    }
  ];
  
  // Select receipt based on file name patterns or random
  let selectedReceipt;
  const fileName = file.name.toLowerCase();
  
  if (fileName.includes('coffee') || fileName.includes('cafe')) {
    selectedReceipt = sampleReceipts[1]; // Coffee shop receipt
  } else if (fileName.includes('gas') || fileName.includes('fuel')) {
    selectedReceipt = sampleReceipts[2]; // Gas station receipt
  } else {
    selectedReceipt = sampleReceipts[Math.floor(Math.random() * sampleReceipts.length)];
  }
  
  console.log(`✅ Edge Function: Generated mock receipt for ${selectedReceipt.merchant}:`, {
    merchant: selectedReceipt.merchant,
    total: selectedReceipt.total,
    itemCount: selectedReceipt.items.length,
    date: selectedReceipt.date
  });
  
  return selectedReceipt;
}

serve(async (req) => {
  console.log("=== Receipt scanning function called ===");
  console.log(`🌐 Edge Function: Request method: ${req.method}`);
  console.log(`🕐 Edge Function: Request timestamp: ${new Date().toISOString()}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("✋ Edge Function: Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    console.error(`❌ Edge Function: Invalid method: ${req.method}`);
    return new Response(JSON.stringify({
      error: 'Method not allowed',
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    console.log("🚀 Edge Function: Starting receipt scanning process");
    
    // Parse the JSON body
    const requestBody = await req.json();
    console.log("📥 Edge Function: Request body received:", {
      fileName: requestBody.fileName,
      fileType: requestBody.fileType,
      fileSize: `${(requestBody.fileSize / 1024).toFixed(1)}KB`,
      hasFile: !!requestBody.file,
      base64Length: requestBody.file ? requestBody.file.length : 0,
      timestamp: requestBody.timestamp
    });
    
    if (!requestBody.file || !requestBody.fileName) {
      console.error("❌ Edge Function: No file data found in request body");
      return new Response(JSON.stringify({
        error: 'No file data provided',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Convert base64 back to File
    console.log("🔄 Edge Function: Converting base64 to File object...");
    const base64Data = requestBody.file;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const receiptFile = new File([binaryData], requestBody.fileName, { 
      type: requestBody.fileType 
    });
    
    console.log(`📋 Edge Function: Created File object:`, {
      name: receiptFile.name,
      size: `${(receiptFile.size / 1024).toFixed(1)}KB`,
      type: receiptFile.type
    });

    // Validate file type
    if (!receiptFile.type.startsWith('image/')) {
      console.error(`❌ Edge Function: Invalid file type: ${receiptFile.type}`);
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
      console.error(`❌ Edge Function: File too large: ${(receiptFile.size / 1024 / 1024).toFixed(1)}MB`);
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
      console.log(`⏱️ Edge Function: Setting timeout for OCR processing: ${timeoutDuration}ms`);
      
      const results = await Promise.race([
        runOCR(receiptFile),
        createTimeout(timeoutDuration)
      ]);
      
      // Check if this was a timeout
      if ('isTimeout' in results) {
        console.log("⏰ Edge Function: OCR processing timed out");
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
      console.log("✅ Edge Function: OCR processing completed successfully");
      console.log(`📤 Edge Function: Returning results:`, {
        success: results.success,
        merchant: results.merchant,
        total: results.total,
        itemCount: results.items?.length || 0,
        date: results.date
      });
      
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
      console.error("💥 Edge Function: Error processing receipt:", error);
      return new Response(JSON.stringify({
        error: 'Receipt processing failed',
        details: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("💥 Edge Function: Unhandled error in scan-receipt function:", error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
