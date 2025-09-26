
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
    
    const prompt = `Analyze this receipt image and extract the following information in JSON format:
    {
      "success": true,
      "date": "YYYY-MM-DD format",
      "merchant": "store name",
      "items": [
        {
          "description": "item name (keep concise)",
          "amount": "0.00",
          "category": "Food|Transportation|Shopping|Entertainment|Healthcare|Utilities|Other",
          "paymentMethod": "Card"
        }
      ],
      "total": "total amount"
    }
    
    Important guidelines:
    - Keep item descriptions concise and clear
    - Use standard categories: Food, Transportation, Shopping, Entertainment, Healthcare, Utilities, Other
    - Format amounts as strings with 2 decimal places
    - If date is unclear, use today's date
    - Extract ALL line items as separate entries
    - Default payment method to "Card"
    - Ensure every item has a valid amount greater than 0
    - Do not create fake or placeholder items
    - If you cannot read the receipt clearly, return success: false
    - Return ONLY valid JSON, no additional text or formatting`;

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
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1,
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
      
      // Validate each item
      const validItems = parsedData.items.filter((item: any) => {
        return item.description && 
               item.amount && 
               !isNaN(parseFloat(item.amount)) && 
               parseFloat(item.amount) > 0;
      });
      
      if (validItems.length === 0) {
        throw new Error('No valid items with amounts found in receipt');
      }
      
      // Update the parsed data with only valid items
      parsedData.items = validItems;
      
      console.log(`✅ OpenAI processing successful: ${validItems.length} valid items found`);
      return new Response(JSON.stringify(parsedData), {
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
