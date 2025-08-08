
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processReceiptWithOpenAI } from "./services/openaiService.ts";

serve(async (req) => {
  console.log("=== Receipt scanning function called ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const requestBody = await req.text();
    console.log("Request body length:", requestBody.length);

    if (!requestBody) {
      console.error("No request body received");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No request body provided" 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body" 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const { file, fileName, fileType, fileSize } = parsedBody;

    console.log("📥 Request received:", {
      fileName,
      fileSize: fileSize ? `${(fileSize / 1024).toFixed(1)}KB` : 'unknown',
      hasFile: !!file,
      fileType,
      fileLength: file?.length || 0
    });

    if (!file) {
      console.error("No file data provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No file data provided" 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OCR service not configured" 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log("🤖 Using OpenAI Vision API for OCR processing");

    // Convert base64 string to File-like object for processing
    const fileBuffer = Uint8Array.from(atob(file), c => c.charCodeAt(0));
    const fileBlob = new File([fileBuffer], fileName || 'receipt.png', {
      type: fileType || 'image/png'
    });

    console.log("Making OpenAI API request...");
    const ocrResults = await processReceiptWithOpenAI(fileBlob, OPENAI_API_KEY);
    
    console.log("OpenAI response received, parsing...");

    if (!ocrResults.success) {
      console.error("❌ Error parsing OpenAI response:", ocrResults.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: ocrResults.error || "Failed to process receipt" 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Ensure we have valid items
    if (!ocrResults.items || ocrResults.items.length === 0) {
      console.log("No items extracted, creating fallback");
      ocrResults.items = [{
        description: ocrResults.merchant || "Store Purchase",
        amount: ocrResults.total || "0.00",
        category: "Other",
        date: ocrResults.date || new Date().toISOString().split('T')[0],
        paymentMethod: "Card"
      }];
    }

    console.log(`✅ Successfully processed receipt with ${ocrResults.items.length} items`);

    return new Response(
      JSON.stringify({
        success: true,
        items: ocrResults.items,
        date: ocrResults.date,
        merchant: ocrResults.merchant,
        total: ocrResults.total
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error("💥 Error in scan-receipt function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
