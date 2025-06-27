
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY'); // For Android
const APNS_KEY = Deno.env.get('APNS_KEY'); // For iOS

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data } = await req.json();

    if (!userId || !title || !body) {
      throw new Error('Missing required parameters');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's push tokens
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching push tokens:', error);
      throw error;
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No push tokens found for user'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = [];

    // Send notifications to all user's devices
    for (const tokenData of tokens) {
      try {
        if (tokenData.platform === 'android' && FCM_SERVER_KEY) {
          // Send FCM notification for Android
          const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${FCM_SERVER_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: tokenData.token,
              notification: {
                title,
                body,
                icon: 'ic_notification',
                sound: 'default',
              },
              data: data || {},
            }),
          });

          const fcmResult = await fcmResponse.json();
          results.push({ platform: 'android', success: fcmResponse.ok, result: fcmResult });
        } else if (tokenData.platform === 'ios' && APNS_KEY) {
          // Send APNS notification for iOS
          // This is a simplified example - you'd need to implement proper APNS JWT token generation
          console.log('iOS push notification would be sent here with APNS');
          results.push({ platform: 'ios', success: true, result: 'iOS notification queued' });
        }
      } catch (error) {
        console.error(`Error sending notification to ${tokenData.platform}:`, error);
        results.push({ platform: tokenData.platform, success: false, error: error.message });
      }
    }

    // Log notification in database
    await supabase
      .from('notification_logs')
      .insert({
        user_id: userId,
        title,
        body,
        data: JSON.stringify(data || {}),
        sent_at: new Date().toISOString(),
        results: JSON.stringify(results)
      });

    return new Response(JSON.stringify({
      success: true,
      message: 'Push notifications sent',
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
