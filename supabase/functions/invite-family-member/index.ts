import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { familyId, email } = await req.json();

    if (!familyId || !email) {
      return new Response(
        JSON.stringify({ error: "Family ID and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has permission to invite (owner or admin)
    const { data: membership, error: membershipError } = await supabaseClient
      .from("family_members")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (membershipError || !membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to invite members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from("family_invitations")
      .insert({
        family_id: familyId,
        email,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get family name for email
    const { data: family } = await supabaseClient
      .from("families")
      .select("name")
      .eq("id", familyId)
      .single();

    // Send invitation email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const inviteUrl = `${req.headers.get("origin")}/app/family/accept?token=${token}`;
      
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Hisaab Dost <onboarding@resend.dev>",
          to: [email],
          subject: `You've been invited to join ${family?.name || 'a family'} on Hisaab Dost`,
          html: `
            <h1>Family Invitation</h1>
            <p>You've been invited to join ${family?.name || 'a family'} on Hisaab Dost!</p>
            <p>Click the link below to accept the invitation:</p>
            <p><a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
            <p>This invitation will expire in 7 days.</p>
            <p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, invitation }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in invite-family-member:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
