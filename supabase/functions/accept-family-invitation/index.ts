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

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
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

    // Get user email
    const userEmail = user.email;
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find and validate invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from("family_invitations")
      .select("*")
      .eq("token", token)
      .eq("email", userEmail)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invitation" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update invitation status to expired
      await supabaseClient
        .from("family_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({ error: "Invitation has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseClient
      .from("family_members")
      .select("id")
      .eq("family_id", invitation.family_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "You are already a member of this family" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add user to family
    const { error: addMemberError } = await supabaseClient
      .from("family_members")
      .insert({
        family_id: invitation.family_id,
        user_id: user.id,
        role: "member",
        is_active: true,
      });

    if (addMemberError) {
      console.error("Error adding member:", addMemberError);
      return new Response(
        JSON.stringify({ error: "Failed to join family" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user's active family to the newly joined family
    await supabaseClient
      .from("profiles")
      .update({ active_family_id: invitation.family_id })
      .eq("id", user.id);

    // Update invitation status
    await supabaseClient
      .from("family_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    // Log activity
    await supabaseClient.from("activity_logs").insert({
      user_id: user.id,
      action_type: "family_joined",
      action_description: `Joined family: ${invitation.family_name || 'Unknown'}`,
      metadata: { 
        family_id: invitation.family_id,
        invited_by: invitation.invited_by,
      },
    });

    return new Response(
      JSON.stringify({ success: true, familyId: invitation.family_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in accept-family-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
