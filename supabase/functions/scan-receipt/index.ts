
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("=== scan-receipt function loaded ===");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== Receipt scanning function called ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed');
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Invalid content type:", contentType);
      throw new Error('Content-Type must be application/json');
    }

    // Get request body text first to check if it's empty
    const bodyText = await req.text();
    console.log("Request body length:", bodyText.length);
    
    if (!bodyText || bodyText.trim().length === 0) {
      console.error("Empty request body received");
      throw new Error('Request body is empty. Please provide file data.');
    }

    // Parse JSON safely
    let requestData;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Body content (first 200 chars):", bodyText.substring(0, 200));
      throw new Error('Invalid JSON in request body: ' + (parseError instanceof Error ? parseError.message : 'Unknown parse error'));
    }

    const { file, fileName, fileType, fileSize } = requestData;

    console.log(`📥 Request received:`, {
      fileName: fileName || 'unknown',
      fileSize: fileSize ? `${(fileSize / 1024).toFixed(1)}KB` : 'unknown',
      hasFile: !!file,
      fileType: fileType || 'unknown',
      fileLength: file ? file.length : 0
    });

    if (!file) {
      throw new Error('No file provided in request');
    }

    if (typeof file !== 'string') {
      throw new Error('File must be provided as base64 string');
    }

    // Validate file size (20MB limit for processing)
    if (fileSize && fileSize > 20 * 1024 * 1024) {
      throw new Error('File too large. Please use an image smaller than 20MB.');
    }

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not configured");
      throw new Error('Receipt processing service is not configured. Please contact support.');
    }

    console.log("🤖 Using OpenAI Vision API for OCR processing");
    
    const prompt = `You are an advanced financial document OCR system specialized in extracting data from receipts in ANY condition - including damaged, faded, crumpled, blurry, or poorly photographed receipts.

  CRITICAL INSTRUCTIONS FOR CHALLENGING IMAGES:
  - For FADED TEXT: Analyze pixel patterns and context to infer likely characters
  - For DAMAGED/CRUMPLED receipts: Piece together visible fragments and use context to complete information
  - For BLURRY images: Use surrounding context and common receipt patterns to make educated interpretations
  - For POOR LIGHTING: Enhance contrast mentally and focus on detectable edges of characters
  - Extract EVERY item/product/service listed, no matter how challenging to read
  - If text is partially visible, provide your best interpretation based on visible portions and context
  - Use common receipt patterns (e.g., typical item names, price formats) to fill gaps
  - Indicate uncertainty in confidence score but ALWAYS provide an interpretation
  
  EXTRACTION REQUIREMENTS:
  - Extract ALL items with individual prices, quantities, and descriptions
  - Extract merchant/store name (or indicate "Unknown Store" if illegible)
  - Extract date and time (or indicate "Date unclear" if illegible)
  - Extract subtotal, tax, fees, tips, and final total
  - Extract payment method if visible
  - Format all amounts as numbers (e.g., "12.99" not "$12.99")
  - Assign appropriate categories to items based on description
  
  CONFIDENCE SCORING:
  - Set confidence to 0.9+ for clear, readable receipts
  - Set confidence to 0.6-0.8 for partially damaged/faded receipts where most info is extractable
  - Set confidence to 0.3-0.5 for heavily damaged receipts where significant interpretation is needed
  - NEVER return confidence below 0.3 - always provide your best attempt
  
  Return a JSON object with this EXACT structure:
  {
    "success": true,
    "merchant": "store name or 'Unknown Store'",
    "date": "YYYY-MM-DD or 'Date unclear'",
    "time": "HH:MM or 'Time unclear'",
    "items": [
      {
        "name": "item description (partial if necessary)",
        "quantity": 1,
        "price": "0.00",
        "category": "appropriate category"
      }
    ],
    "subtotal": "0.00",
    "tax": "0.00",
    "tip": "0.00",
    "total": "0.00",
    "paymentMethod": "Cash|Card|Other|Unknown",
    "confidence": 0.65,
    "notes": "Optional: mention any significant interpretation or unclear areas"
  }`;

    console.log("Making OpenAI API request...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType || 'image/jpeg'};base64,${file}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        throw new Error('OpenAI API quota exceeded. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check API key.');
      } else if (response.status === 413) {
        throw new Error('Image file too large. Please use a smaller image.');
      } else {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    console.log("OpenAI response received, parsing...");

    try {
      // Clean and extract JSON from the response
      let jsonString = content.trim();
      
      // Remove any markdown formatting
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Extract JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON found in response:", content);
        throw new Error('No JSON found in OpenAI response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate the parsed data
      if (!parsedData.success) {
        throw new Error('OpenAI could not process the receipt clearly');
      }
      
      if (!parsedData.items || parsedData.items.length === 0) {
        throw new Error('No items found in receipt');
      }
      
      // Validate and normalize each item (support both old and new field names)
      const validItems = parsedData.items.filter((item: any) => {
        // Support both 'name'/'description' and 'price'/'amount' field names
        const description = item.name || item.description;
        const amount = item.price || item.amount;
        
        return description && 
               amount && 
               !isNaN(parseFloat(amount)) && 
               parseFloat(amount) > 0;
      }).map((item: any) => {
        // Normalize to standard field names
        return {
          description: item.name || item.description,
          amount: item.price || item.amount,
          date: item.date || parsedData.date || new Date().toISOString().split('T')[0],
          category: item.category || 'Other',
          paymentMethod: item.paymentMethod || parsedData.paymentMethod || 'Card'
        };
      });
      
      if (validItems.length === 0) {
        throw new Error('No valid items with amounts found in receipt');
      }
      
      // Build the complete response with all financial fields
      const responseData = {
        success: parsedData.success,
        merchant: parsedData.merchant || 'Unknown',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        items: validItems,
        // Include all financial totals from the receipt
        subtotal: parsedData.subtotal,
        tax: parsedData.tax, // This is critical - preserving tax amount
        tip: parsedData.tip,
        total: parsedData.total,
        paymentMethod: parsedData.paymentMethod,
        confidence: parsedData.confidence,
        notes: parsedData.notes,
        warning: parsedData.confidence < 0.7 ? 'Some values may be approximate due to receipt condition' : undefined
      };
      
      console.log(`✅ OpenAI processing successful: ${validItems.length} valid items found`);
      console.log(`📊 Financial totals - Subtotal: ${responseData.subtotal}, Tax: ${responseData.tax}, Total: ${responseData.total}`);
      
      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("❌ Error parsing OpenAI response:", parseError);
      console.error("Raw response:", content);
      throw new Error('Failed to parse OCR results');
    }
  } catch (error) {
    console.error('💥 Error in scan-receipt function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Receipt processing failed',
      items: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
