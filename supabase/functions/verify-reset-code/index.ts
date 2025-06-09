
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyTokenRequest {
  email: string;
  token: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token }: VerifyTokenRequest = await req.json();

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: "Email and token are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the token
    const { data: resetCodes, error: selectError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selectError) {
      console.error("Error finding reset token:", selectError);
      return new Response(
        JSON.stringify({ error: "Failed to verify token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resetCodes || resetCodes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired reset link" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetCode = resetCodes[0];

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(resetCode.expires_at);
    
    if (now > expiresAt) {
      // Mark as used to prevent reuse
      await supabaseAdmin
        .from("password_reset_codes")
        .update({ used: true })
        .eq("id", resetCode.id);

      return new Response(
        JSON.stringify({ error: "Reset link has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Token is valid - return success but don't mark as used yet
    // It will be marked as used when the password is actually updated
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reset link verified successfully",
        tokenId: resetCode.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-reset-code:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
