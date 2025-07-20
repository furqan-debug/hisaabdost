
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

const generateResetToken = (): string => {
  return crypto.randomUUID();
};

const sendResetEmail = async (email: string, resetToken: string) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  console.log("=== EMAIL SENDING DEBUG ===");
  console.log("Email to send to:", email);
  console.log("Reset token:", resetToken);
  console.log("Resend API key exists:", resendApiKey ? "YES" : "NO");
  console.log("Resend API key length:", resendApiKey ? resendApiKey.length : 0);
  
  if (!resendApiKey) {
    console.error("❌ RESEND_API_KEY is not configured");
    throw new Error("Email service not configured - missing RESEND_API_KEY");
  }

  const resetLink = `https://ccb1b398-4ebf-47e1-ac45-1522f307f140.lovableproject.com/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  console.log("Reset link generated:", resetLink);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          We received a request to reset your password for your HisaabDost account. 
          Click the button below to reset your password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin: 25px 0;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        
        <div style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; word-break: break-all; font-family: monospace; font-size: 12px;">
          ${resetLink}
        </div>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            <strong>Security Notes:</strong>
          </p>
          <ul style="font-size: 14px; color: #666; padding-left: 20px;">
            <li>This link will expire in 15 minutes for security</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          Best regards,<br>
          <strong>The HisaabDost Team</strong>
        </p>
      </div>
    </body>
    </html>
  `;

  const emailPayload = {
    from: "HisaabDost <noreply@hisaabdost.com>",
    to: [email],
    subject: "Reset Your HisaabDost Password",
    html: emailHtml,
  };

  console.log("📧 Preparing to send email with payload:", JSON.stringify(emailPayload, null, 2));

  try {
    console.log("🚀 Making request to Resend API...");
    console.log("Resend API URL: https://api.resend.com/emails");
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    console.log("📨 Resend API response status:", response.status);
    console.log("📨 Resend API response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("📨 Resend API response body:", responseText);

    if (!response.ok) {
      console.error("❌ Resend API error:", response.status, responseText);
      throw new Error(`Email service error: ${response.status} - ${responseText}`);
    }

    console.log("✅ Password reset email sent successfully to:", email);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("💥 Failed to send password reset email:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🔥 Password reset handler started");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("📥 Raw request body:", requestBody);
    
    const { email }: SendResetCodeRequest = JSON.parse(requestBody);
    console.log("📧 Password reset request received for email:", email);

    if (!email || !email.includes("@")) {
      console.error("❌ Invalid email provided:", email);
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limiting
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    console.log("⏰ Checking rate limiting since:", oneMinuteAgo);
    
    const { data: recentCodes, error: rateLimitError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("id")
      .eq("email", email)
      .gte("created_at", oneMinuteAgo);

    if (rateLimitError) {
      console.error("❌ Rate limit check error:", rateLimitError);
    }

    if (recentCodes && recentCodes.length > 0) {
      console.log("🛑 Rate limit hit for email:", email, "recent codes:", recentCodes.length);
      return new Response(
        JSON.stringify({ error: "Please wait a minute before requesting another reset link" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user exists using listUsers with pagination
    console.log("👤 Checking if user exists...");
    
    let userExists = false;
    let page = 1;
    const perPage = 1000;
    
    try {
      while (!userExists) {
        const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage
        });
        
        console.log(`👤 User lookup page ${page}:`, usersData ? `Got ${usersData.users?.length || 0} users` : "No users data");
        console.log("👤 User lookup error:", userError);
        
        if (userError) {
          console.error("❌ Error checking users:", userError);
          return new Response(
            JSON.stringify({ error: "Failed to verify user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (!usersData || !usersData.users || usersData.users.length === 0) {
          // No more users to check
          break;
        }
        
        // Check if user exists in this batch
        userExists = usersData.users.some(user => user.email === email);
        
        if (userExists) {
          console.log("👤 User found in page", page);
          break;
        }
        
        // If we got less than perPage users, we've reached the end
        if (usersData.users.length < perPage) {
          break;
        }
        
        page++;
      }
      
      console.log("👤 User exists check result:", userExists ? "true" : "false", "for email:", email);
      
      if (!userExists) {
        // For security, we still send a success response but don't actually send an email
        console.log("🔒 User does not exist, returning success for security (no email sent)");
        return new Response(
          JSON.stringify({ success: true, message: "If the email exists, a reset link has been sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (userCheckError) {
      console.error("💥 Error checking user existence:", userCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate any existing unused codes for this email
    console.log("🗑️ Invalidating old reset codes...");
    const { error: updateError } = await supabaseAdmin
      .from("password_reset_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    if (updateError) {
      console.error("❌ Error invalidating old codes:", updateError);
    }

    // Generate new token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log("🎫 Generated reset token:", token);
    console.log("⏰ Token expires at:", expiresAt);

    // Store the token
    console.log("💾 Storing reset token in database...");
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_codes")
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("❌ Error storing reset token:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Reset token stored successfully");

    // Send reset email
    console.log("📧 Attempting to send reset email...");
    try {
      await sendResetEmail(email, token);
      console.log("🎉 Password reset process completed successfully for:", email);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Password reset link has been sent to your email"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (emailError) {
      console.error("💥 Email sending failed:", emailError);
      console.error("Email error message:", emailError.message);
      
      return new Response(
        JSON.stringify({ error: `Failed to send reset email: ${emailError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("💥 Error in send-password-reset-code handler:", error);
    console.error("Handler error message:", error.message);
    console.error("Handler error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

console.log("🚀 Password reset edge function initialized");
serve(handler);
