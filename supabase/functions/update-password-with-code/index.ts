import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePasswordRequest {
  token?: string;
  code?: string;
  email: string;
  newPassword: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  console.log("🔐 Update password handler started");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("📥 Raw request body:", requestBody);
    
    const { token, code, email, newPassword }: UpdatePasswordRequest = JSON.parse(requestBody);
    const codeOrToken = code || token; // Prefer code over token
    console.log("🔐 Updating password for email:", email, "code/token:", codeOrToken);

    if (!codeOrToken || !email || !newPassword) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Code/token, email, and new password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newPassword.length < 6) {
      console.error("❌ Password too short");
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up expired tokens first
    await supabaseAdmin
      .from("password_reset_codes")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Verify the code/token is valid and not expired
    const { data: resetCode, error: queryError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .or(`code.eq.${codeOrToken},token.eq.${codeOrToken}`)
      .single();

    if (queryError || !resetCode) {
      console.error("❌ Invalid or expired token:", queryError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired reset token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Reset token verified, updating password...");

    // Get the user by email
    let userExists = false;
    let page = 1;
    const perPage = 1000;
    let userId = null;
    
    while (!userExists) {
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
      
      const user = usersData.users.find(user => user.email === email);
      if (user) {
        userExists = true;
        userId = user.id;
        break;
      }
      
      if (usersData.users.length < perPage) {
        break;
      }
      
      page++;
    }

    if (!userExists || !userId) {
      console.error("❌ User not found");
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Password updated successfully");

    // Mark the reset code as used
    const { error: markUsedError } = await supabaseAdmin
      .from("password_reset_codes")
      .update({ used: true })
      .eq("email", email)
      .or(`code.eq.${codeOrToken},token.eq.${codeOrToken}`);

    if (markUsedError) {
      console.error("❌ Error marking reset code as used:", markUsedError);
      // Don't fail the request, password was already updated
    }

    console.log("🎉 Password reset completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password updated successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Error in update-password-with-code handler:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

console.log("🚀 Update password edge function initialized");
serve(handler);