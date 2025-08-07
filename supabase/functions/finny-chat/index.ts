
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { processAction } from "./services/actionProcessor.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Define expense categories
const EXPENSE_CATEGORIES = [
  "Food", "Rent", "Utilities", "Transportation", 
  "Entertainment", "Shopping", "Healthcare", "Other"
];

// Get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Generate system message with user categories
function generateSystemMessage(userCategories: string[]) {
  return `You are Finny, a helpful AI financial assistant for the Expensify AI app.
Keep all responses simple, direct, and to the point. For actions like adding expenses or updating budgets, just confirm the action without extra details.

COMMUNICATION STYLE:
- Be concise and direct
- Use simple language
- Confirm actions briefly
- Avoid lengthy explanations unless asked
- No excessive emojis or enthusiasm
- Get straight to the point

EXPENSE CATEGORIES (ONLY use these):
${userCategories.map(cat => `- ${cat}`).join('\n')}

ACTION CAPABILITIES:
1. Add expenses: [ACTION:{"type":"add_expense","amount":1500,"category":"Food & Dining","date":"${getTodaysDate()}","description":"Lunch"}]
2. Set budgets: [ACTION:{"type":"set_budget","category":"Food & Dining","amount":3000,"period":"monthly"}]
3. Update budgets: [ACTION:{"type":"set_budget","category":"Transportation","amount":1200,"period":"monthly"}]
4. Set goals: [ACTION:{"type":"set_goal","title":"Emergency Fund","targetAmount":50000,"deadline":"2024-12-31"}]
5. Add wallet funds: [ACTION:{"type":"add_wallet_funds","amount":10000,"description":"Monthly budget"}]
6. Set income: [ACTION:{"type":"set_income","amount":75000,"period":"monthly"}]

IMPORTANT: Always use [ACTION:...] format when user wants to create, update, or modify expenses, budgets, goals, or income.
For budget updates, use "set_budget" action type even if budget already exists - the system will handle the update automatically.

RESPONSE EXAMPLES:
- "Added $15 lunch expense to Food & Dining category." [ACTION:{"type":"add_expense","amount":15,"category":"Food & Dining","description":"lunch"}]
- "Set Food & Dining budget to $300/month." [ACTION:{"type":"set_budget","category":"Food & Dining","amount":300,"period":"monthly"}]
- "Updated Transportation budget to $1200/month." [ACTION:{"type":"set_budget","category":"Transportation","amount":1200,"period":"monthly"}]
- "Emergency fund goal created for $500." [ACTION:{"type":"set_goal","title":"Emergency Fund","targetAmount":500,"deadline":"2024-12-31"}]
- "Added $100 to wallet." [ACTION:{"type":"add_wallet_funds","amount":100,"description":"Budget addition"}]

CRITICAL: User requests to update, change, set, or modify budgets MUST include the [ACTION:...] format.
Examples of budget update requests:
- "update transportation budget to 1200" → [ACTION:{"type":"set_budget","category":"Transportation","amount":1200,"period":"monthly"}]
- "set food budget to 500" → [ACTION:{"type":"set_budget","category":"Food & Dining","amount":500,"period":"monthly"}]
- "change utilities budget to 150" → [ACTION:{"type":"set_budget","category":"Bills & Utilities","amount":150,"period":"monthly"}]

Keep responses under 2 sentences when possible.`;
  
}

// Handle HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(JSON.stringify({
        response: "Invalid request. Please try again.",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Invalid request format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { 
      message, 
      userId, 
      chatHistory = [], 
      currencyCode = 'USD',
      userName,
      userAge,
      userGender,
      image,
      hasImage = false
    } = requestBody;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        response: "Please share what you need help with regarding your finances.",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Message is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({
        response: "Please log in to use Finny.",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'User ID is required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Processing request:", { message: message.substring(0, 100) + '...', userId, currencyCode, hasImage });

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing');
      return new Response(JSON.stringify({
        response: "Service temporarily unavailable. Please contact support.",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Supabase configuration missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile
    let userProfile = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, preferred_currency, monthly_income')
        .eq('id', userId)
        .single();
      userProfile = data;
    } catch (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    const displayName = userName || userProfile?.full_name || 'there';

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        response: `Hi ${displayName}! I'm currently offline. Please contact support to get me running.`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'OpenAI API key not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch basic financial context and user categories
    const [expensesResult, budgetsResult, profileResult, customCategoriesResult] = await Promise.allSettled([
      supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(5),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('profiles').select('monthly_income').eq('id', userId).single(),
      supabase.from('custom_categories').select('name').eq('user_id', userId)
    ]);

    // Extract data safely
    const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
    const budgets = budgetsResult.status === 'fulfilled' ? budgetsResult.value.data || [] : [];
    const monthlyIncome = profileResult.status === 'fulfilled' ? profileResult.value.data?.monthly_income || 'Not set' : 'Not set';
    const customCategories = customCategoriesResult.status === 'fulfilled' ? customCategoriesResult.value.data || [] : [];

    // Combine default and custom categories
    const defaultCategories = [
      'Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 
      'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
      'Gifts & Donations', 'Personal Care', 'Home & Garden', 'Business', 'Other'
    ];
    const customCategoryNames = customCategories.map((cat: any) => cat.name);
    const allUserCategories = [...defaultCategories, ...customCategoryNames];

    // Prepare simple context for OpenAI
    const contextMessage = `USER: ${displayName}
Currency: ${currencyCode}
Monthly Income: ${monthlyIncome}
Recent Expenses: ${JSON.stringify(expenses.slice(0, 3))}
Current Budgets: ${JSON.stringify(budgets)}`;

    // Generate system message with user's categories
    const FINNY_SYSTEM_MESSAGE = generateSystemMessage(allUserCategories);

    // Handle image processing if present
    let imageAnalysis = '';
    let isReceiptDetected = false;
    let receiptData = null;

    if (hasImage && image) {
      try {
        console.log("Processing image with smart bill detection");
        
        // First, check if this is a bill/receipt
        const detectionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this image and determine if it's a bill, receipt, or invoice that contains expense information. 

Look for these elements:
- Store/merchant names
- Purchase amounts or totals
- Dates
- Item lists with prices
- Tax information
- Receipt formats

Return ONLY this JSON format:
{
  "is_bill": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}

Be strict - only return is_bill: true if it's clearly a financial document with expense information.`
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: image
                    }
                  }
                ]
              }
            ],
            max_tokens: 200,
            temperature: 0.1
          }),
        });

        if (detectionResponse.ok) {
          const detectionData = await detectionResponse.json();
          const detectionContent = detectionData.choices?.[0]?.message?.content || '';
          console.log("Detection response:", detectionContent);
          
          try {
            const jsonMatch = detectionContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const detection = JSON.parse(jsonMatch[0]);
              isReceiptDetected = detection.is_bill && detection.confidence > 0.7;
              console.log("Receipt detection result:", { isReceiptDetected, confidence: detection.confidence });
              
              if (!isReceiptDetected) {
                imageAnalysis = `This doesn't look like a bill or receipt. I can only help process financial documents like receipts, invoices, or bills. Please upload a clear image of a receipt if you'd like me to create an expense entry.`;
                console.log("Image rejected - not a receipt");
              }
            }
          } catch (parseError) {
            console.error("Error parsing detection response:", parseError);
            isReceiptDetected = false;
          }
        }

        // If it's detected as a receipt, process it with our OCR system
        if (isReceiptDetected) {
          console.log("Detected as receipt - processing with OCR");
          
          // Extract base64 data from data URL
          const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
          const fileType = image.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
          
          try {
            // Call our scan-receipt function
            const scanResponse = await fetch(`${SUPABASE_URL}/functions/v1/scan-receipt`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                file: base64Data,
                fileType,
                fileName: 'receipt.jpg'
              }),
            });

            if (scanResponse.ok) {
              receiptData = await scanResponse.json();
              console.log("OCR processing successful:", receiptData);
              
              if (receiptData.success && receiptData.items && receiptData.items.length > 0) {
                // Auto-categorize and create expenses
                const totalAmount = receiptData.items.reduce((sum: number, item: any) => 
                  sum + parseFloat(item.amount || '0'), 0);
                
                // Auto-create the expense using our action system
                const mainItem = receiptData.items.length === 1 ? receiptData.items[0] : {
                  description: `${receiptData.merchant || 'Purchase'} - ${receiptData.items.length} items`,
                  amount: totalAmount.toFixed(2),
                  category: receiptData.items[0].category || 'Other',
                  date: receiptData.date || getTodaysDate(),
                  paymentMethod: 'Card'
                };

                imageAnalysis = `Perfect! I've scanned your receipt and found ${receiptData.items.length} item${receiptData.items.length > 1 ? 's' : ''} from ${receiptData.merchant || 'your purchase'} totaling $${totalAmount.toFixed(2)}. Creating your expense entry now...

[ACTION:{"type":"add_expense","amount":${totalAmount},"category":"${mainItem.category}","date":"${mainItem.date}","description":"${mainItem.description}","paymentMethod":"${mainItem.paymentMethod}"}]`;
              } else {
                imageAnalysis = "I could see this is a receipt, but I had trouble extracting the details clearly. Could you try with a clearer image or different angle?";
              }
            } else {
              console.error("OCR scan failed:", scanResponse.status);
              imageAnalysis = "I detected this is a receipt, but our scanning service is currently unavailable. Please try again later.";
            }
          } catch (ocrError) {
            console.error("OCR processing error:", ocrError);
            imageAnalysis = "I detected this is a receipt, but had trouble processing it. Please try again with a clearer image.";
          }
        }
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        imageAnalysis = 'Error processing the image. Please try again.';
      }
    }

    // Prepare messages for OpenAI
    let userMessage = message;
    if (hasImage && imageAnalysis) {
      userMessage = `${message}\n\nImage Analysis: ${imageAnalysis}`;
    }

    const openAIMessages = [
      { role: "system", content: FINNY_SYSTEM_MESSAGE },
      { role: "system", content: contextMessage },
      ...chatHistory.slice(-6).map((msg: any) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    console.log("Sending request to OpenAI");

    // Call OpenAI API
    let openAIResponse;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: openAIMessages,
          max_tokens: 800,
          temperature: 0.3,
        }),
      });
    } catch (fetchError) {
      console.error("Network error calling OpenAI:", fetchError);
      return new Response(JSON.stringify({
        response: `Sorry ${displayName}, I'm having connectivity issues. Please try again.`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Network error'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", openAIResponse.status, errorText);
      
      if (openAIResponse.status === 429) {
        return new Response(JSON.stringify({
          response: `I'm experiencing high demand right now. Please try again in a moment.`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API quota exceeded'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          response: `Technical issue. Please try again.`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: `OpenAI API error: ${openAIResponse.status}`
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    let openAIData;
    try {
      openAIData = await openAIResponse.json();
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return new Response(JSON.stringify({
        response: `Received invalid response. Please try again.`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Invalid response format'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let responseText = openAIData.choices?.[0]?.message?.content || `Sorry, I couldn't process that request. Please try again.`;

    console.log("OpenAI response:", responseText.substring(0, 200) + '...');

    // Process actions in the response
    const actionRegex = /\[ACTION:({[^}]+})\]/g;
    let actionMatch;
    let processedActions = [];

    while ((actionMatch = actionRegex.exec(responseText)) !== null) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        console.log("Processing action:", actionData);
        
        const actionResult = await processAction(actionData, userId, supabase);
        processedActions.push({ action: actionData, result: actionResult });
        
        console.log("Action processed successfully:", actionResult);
      } catch (error) {
        console.error("Error processing action:", error);
        processedActions.push({ 
          action: actionMatch[1], 
          result: `Action failed: ${error.message}` 
        });
      }
    }

    // Remove action tags from response
    let finalResponse = responseText.replace(actionRegex, '');
    if (processedActions.length > 0) {
      const actionResults = processedActions.map(pa => pa.result).join('\n');
      if (actionResults) {
        finalResponse = actionResults + (finalResponse.trim() ? '\n\n' + finalResponse.trim() : '');
      }
    }

    console.log("Final response:", finalResponse.substring(0, 200) + '...');

    return new Response(JSON.stringify({
      response: finalResponse,
      rawResponse: responseText,
      visualData: null,
      action: processedActions.length > 0 ? processedActions[0].action : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(JSON.stringify({
      response: `Technical error occurred. Please try again.`,
      rawResponse: null,
      visualData: null,
      action: null,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
