import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyResetCodeRequest {
  token?: string;
  code?: string;
  email: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  console.log("🔍 Verify reset code handler started");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("📥 Raw request body:", requestBody);
    
    const { token, code, email }: VerifyResetCodeRequest = JSON.parse(requestBody);
    const codeOrToken = code || token; // Prefer code over token
    console.log("🔍 Verifying reset code for email:", email, "code/token:", codeOrToken);

    if (!codeOrToken || !email) {
      console.error("❌ Missing code/token or email");
      return new Response(
        JSON.stringify({ error: "Code/token and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the code/token exists and is not expired
    // Try both code and token fields for compatibility
    const { data: resetCode, error: queryError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .or(`code.eq.${codeOrToken},token.eq.${codeOrToken}`)
      .single();

    if (queryError) {
      console.error("❌ Query error:", queryError);
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resetCode) {
      console.log("🔒 Reset code not found or expired");
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Reset code is valid");
    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Error in verify-reset-code handler:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

console.log("🚀 Verify reset code edge function initialized");
serve(handler);