import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  console.log("🔍 Verify email code handler started");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("📥 Raw request body:", requestBody);
    
    const { email, code }: VerifyEmailCodeRequest = JSON.parse(requestBody);
    console.log("🔍 Verifying email code for:", email, "code:", code);

    if (!email || !code) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up expired codes first
    await supabaseAdmin
      .from("verification_codes")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Verify the code is valid and not expired
    const { data: verificationCode, error: queryError } = await supabaseAdmin
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (queryError || !verificationCode) {
      console.error("❌ Invalid or expired code:", queryError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Verification code is valid");

    // Get the user by email and confirm their email
    let page = 1;
    const perPage = 1000;
    let userId = null;
    
    while (!userId) {
      const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (userError) {
        console.error("❌ Error checking users:", userError);
        return new Response(
          JSON.stringify({ error: "Failed to find user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!usersData || !usersData.users || usersData.users.length === 0) {
        break;
      }
      
      const user = usersData.users.find(u => u.email === email);
      if (user) {
        userId = user.id;
        break;
      }
      
      if (usersData.users.length < perPage) {
        break;
      }
      
      page++;
    }

    if (!userId) {
      console.error("❌ User not found");
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Confirm the user's email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email_confirmed: true }
    );

    if (updateError) {
      console.error("❌ Error confirming email:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to confirm email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Email confirmed successfully");

    // Mark the code as used
    const { error: markUsedError } = await supabaseAdmin
      .from("verification_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("code", code);

    if (markUsedError) {
      console.error("❌ Error marking code as used:", markUsedError);
      // Don't fail the request, email was already confirmed
    }

    console.log("🎉 Email verification completed successfully");
    return new Response(
      JSON.stringify({ 
        valid: true,
        message: "Email verified successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Error in verify-email-code handler:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

console.log("🚀 Verify email code edge function initialized");
serve(handler);
