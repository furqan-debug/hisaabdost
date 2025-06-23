
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("=== scan-receipt function loaded ===");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Process receipt with OpenAI (when available)
async function processReceiptWithOpenAI(base64File: string, fileName: string, apiKey: string): Promise<any> {
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
- Do not create fake or placeholder items`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
                url: `data:image/jpeg;base64,${base64File}`,
                detail: 'high'
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
    } else {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from OpenAI');
  }

  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate the parsed data
    if (!parsedData.items || parsedData.items.length === 0) {
      throw new Error('No items found in receipt');
    }
    
    // Validate each item
    const validItems = parsedData.items.filter(item => {
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
    return parsedData;
  } catch (parseError) {
    console.error("❌ Error parsing OpenAI response:", parseError);
    throw new Error('Failed to parse OCR results');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== Receipt scanning function called ===");

  try {
    const { file, fileName, fileType, fileSize } = await req.json();

    console.log(`📥 Request received:`, {
      fileName: fileName || 'unknown',
      fileSize: fileSize ? `${(fileSize / 1024).toFixed(1)}KB` : 'unknown',
      hasFile: !!file,
      fileType: fileType || 'unknown'
    });

    if (!file) {
      throw new Error('No file provided');
    }

    console.log("🔍 Processing receipt with OCR...");

    let result;
    
    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not configured");
      throw new Error('Receipt processing service is not configured. Please contact support.');
    }

    try {
      // Try OpenAI processing
      result = await processReceiptWithOpenAI(file, fileName || 'receipt', OPENAI_API_KEY);
      
      // Ensure we have a valid result
      if (!result || !result.success || !result.items || result.items.length === 0) {
        throw new Error('No valid items could be extracted from the receipt');
      }
      
    } catch (error) {
      console.error("❌ OpenAI OCR failed:", error);
      
      // Return the actual error instead of falling back to mock data
      throw new Error(`Receipt processing failed: ${error.message}`);
    }

    console.log("✅ Processing completed successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in scan-receipt function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Receipt processing failed',
      items: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
