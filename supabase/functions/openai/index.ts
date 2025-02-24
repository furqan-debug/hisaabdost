
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    const { prompt, type = 'chat' } = await req.json();
    console.log('Request type:', type);

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key is not set');
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    console.log('Making OpenAI request...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: type === 'analyze' 
            ? "You are a financial analysis assistant. Analyze the provided data and give concise, actionable insights."
            : "You are a helpful financial advisor assistant that provides concise, practical advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    console.log('OpenAI request successful');
    const content = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        [type === 'analyze' ? 'analysis' : 'text']: content
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in OpenAI function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
