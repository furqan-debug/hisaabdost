
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendResetCodeRequest {
  email: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendResetCodeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limiting - only allow one code request per minute per email
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentCodes } = await supabaseAdmin
      .from("password_reset_codes")
      .select("id")
      .eq("email", email)
      .gte("created_at", oneMinuteAgo);

    if (recentCodes && recentCodes.length > 0) {
      return new Response(
        JSON.stringify({ error: "Please wait a minute before requesting another code" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user exists
    const { data: user } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (!user.user) {
      // For security, we don't reveal if the email exists or not
      return new Response(
        JSON.stringify({ success: true, message: "If the email exists, a reset code has been sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate any existing unused codes for this email
    await supabaseAdmin
      .from("password_reset_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Generate new code
    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the code
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_codes")
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing reset code:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Here you would normally send an email with the code
    // For now, we'll log it (in production, integrate with your email service)
    console.log(`Password reset code for ${email}: ${code}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset code has been sent to your email",
        // Remove this in production - only for testing
        code: Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : code
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-password-reset-code:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
