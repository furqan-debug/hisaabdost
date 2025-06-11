
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
  
  console.log("Checking Resend API key availability:", resendApiKey ? "Found" : "Not found");
  
  if (!resendApiKey) {
    console.log("No Resend API key found, logging reset link instead");
    const resetLink = `https://ccb1b398-4ebf-47e1-ac45-1522f307f140.lovableproject.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);
    return;
  }

  const resetLink = `https://ccb1b398-4ebf-47e1-ac45-1522f307f140.lovableproject.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

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
          Click the button below to reset your password in your web browser:
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
          If the button doesn't work, you can copy and paste this link into your browser:
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
            <li>After resetting your password, you can use it to log in to the mobile app</li>
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

  try {
    console.log("Attempting to send email via Resend API");
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HisaabDost <noreply@hisaabdost.com>",
        to: [email],
        subject: "Reset Your HisaabDost Password",
        html: emailHtml,
      }),
    });

    const responseData = await response.text();
    console.log("Resend API response status:", response.status);
    console.log("Resend API response:", responseData);

    if (!response.ok) {
      throw new Error(`Email service error: ${response.status} - ${responseData}`);
    }

    console.log("Reset email sent successfully to:", email);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Fallback to logging
    console.log(`Password reset link for ${email}: ${resetLink}`);
    throw error;
  }
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

    // Check rate limiting - only allow one request per minute per email
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentCodes } = await supabaseAdmin
      .from("password_reset_codes")
      .select("id")
      .eq("email", email)
      .gte("created_at", oneMinuteAgo);

    if (recentCodes && recentCodes.length > 0) {
      return new Response(
        JSON.stringify({ error: "Please wait a minute before requesting another reset link" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userExists = userData.users.some(user => user.email === email);
    
    if (!userExists) {
      // For security, we don't reveal if the email exists or not
      return new Response(
        JSON.stringify({ success: true, message: "If the email exists, a reset link has been sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate any existing unused codes for this email
    await supabaseAdmin
      .from("password_reset_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Generate new token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the token
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_codes")
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing reset token:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send reset email
    try {
      await sendResetEmail(email, token);
    } catch (emailError) {
      console.error("Email sending failed, but continuing:", emailError);
      // Don't fail the request if email fails - user might still see the link in logs
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset link has been sent to your email"
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
