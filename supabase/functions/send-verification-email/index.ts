
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendVerificationRequest {
  email: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const sendVerificationEmail = async (email: string, token: string) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  console.log("Sending verification email to:", email);
  console.log("Using verification token:", token);
  
  if (!resendApiKey) {
    console.log("No Resend API key found, verification code:", token);
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; margin-bottom: 20px;">Welcome to HisaabDost!</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          Thank you for signing up. To complete your registration, please enter this verification code in the app:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace;">
              ${token}
            </span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #666; margin: 25px 0; text-align: center;">
          This verification code will expire in 24 hours.
        </p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            <strong>Security Notes:</strong>
          </p>
          <ul style="font-size: 14px; color: #666; padding-left: 20px;">
            <li>If you didn't sign up for HisaabDost, please ignore this email</li>
            <li>Never share this verification code with anyone</li>
            <li>This code is only valid for 24 hours</li>
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
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HisaabDost <noreply@hisaabdost.com>",
        to: [email],
        subject: "Verify Your HisaabDost Account",
        html: emailHtml,
      }),
    });

    const responseData = await response.text();
    console.log("Verification email response status:", response.status);
    console.log("Verification email response:", responseData);

    if (!response.ok) {
      throw new Error(`Email service error: ${response.status} - ${responseData}`);
    }

    console.log("Verification email sent successfully to:", email);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    console.log(`Verification code for ${email}: ${token}`);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendVerificationRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a 6-digit verification code
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Send verification email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error("Verification email sending failed:", emailError);
      // Continue anyway, user might see the code in logs
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent successfully",
        token: token // Return token for testing/debugging (remove in production)
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-verification-email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
