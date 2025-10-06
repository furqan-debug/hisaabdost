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
    // Client for auth verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
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

    // Check if user with this email exists in auth.users
    const { data: existingUser, error: userLookupError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userLookupError) {
      console.error("Error looking up user:", userLookupError);
      return new Response(
        JSON.stringify({ error: "Failed to verify email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invitedUser = existingUser.users.find(u => u.email === email);

    if (!invitedUser) {
      return new Response(
        JSON.stringify({ error: "This email is not registered on Hisaab Dost" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is already a member of this family
    const { data: existingMember } = await supabaseAdmin
      .from("family_members")
      .select("id, is_active")
      .eq("family_id", familyId)
      .eq("user_id", invitedUser.id)
      .single();

    if (existingMember) {
      if (existingMember.is_active) {
        return new Response(
          JSON.stringify({ error: "This user is already a member of the family" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Reactivate the member
        const { error: reactivateError } = await supabaseAdmin
          .from("family_members")
          .update({ is_active: true })
          .eq("id", existingMember.id);

        if (reactivateError) {
          console.error("Error reactivating member:", reactivateError);
          return new Response(
            JSON.stringify({ error: "Failed to add member" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Member added successfully!" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Add user directly to family_members
    const { data: newMember, error: addMemberError } = await supabaseAdmin
      .from("family_members")
      .insert({
        family_id: familyId,
        user_id: invitedUser.id,
        role: "member",
        is_active: true,
      })
      .select()
      .single();

    if (addMemberError) {
      console.error("Error adding member:", addMemberError);
      return new Response(
        JSON.stringify({ error: "Failed to add member" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get family name for notification email
    const { data: family } = await supabaseAdmin
      .from("families")
      .select("name")
      .eq("id", familyId)
      .single();

    // Send notification email via Resend (optional)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Hisaab Dost <onboarding@resend.dev>",
          to: [email],
          subject: `You've been added to ${family?.name || 'a family'} on Hisaab Dost`,
          html: `
            <h1>Welcome to ${family?.name || 'a family'}!</h1>
            <p>You've been added to ${family?.name || 'a family'} on Hisaab Dost!</p>
            <p>You can now access shared family expenses and budgets.</p>
            <p><a href="${req.headers.get("origin")}/app/family" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px;">Go to Family</a></p>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Member added successfully!", member: newMember }),
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
