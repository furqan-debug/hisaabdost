
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, title, body, data }: PushNotificationRequest = await req.json();

    console.log('Sending push notification to user:', userId);

    // Get all device tokens for the user
    const { data: tokens, error: tokensError } = await supabase
      .from('user_device_tokens')
      .select('device_token, platform')
      .eq('user_id', userId);

    if (tokensError) {
      console.error('Error fetching device tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found for user:', userId);
      return new Response(
        JSON.stringify({ message: 'No device tokens found', sent: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const results = [];
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY');

    // Send notifications to each device
    for (const token of tokens) {
      try {
        if (token.platform === 'android' && firebaseServerKey) {
          // Send FCM notification for Android
          const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${firebaseServerKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: token.device_token,
              notification: {
                title,
                body,
              },
              data: data || {},
            }),
          });

          const fcmResult = await fcmResponse.json();
          results.push({
            token: token.device_token,
            platform: token.platform,
            success: fcmResponse.ok,
            result: fcmResult,
          });

          console.log(`FCM notification sent to ${token.device_token}:`, fcmResult);
        } else if (token.platform === 'ios') {
          // iOS push notifications would be handled here with APNs
          // For now, we'll log that iOS is not yet configured
          console.log('iOS push notifications not yet configured');
          results.push({
            token: token.device_token,
            platform: token.platform,
            success: false,
            error: 'iOS not configured',
          });
        }
      } catch (error) {
        console.error(`Error sending to token ${token.device_token}:`, error);
        results.push({
          token: token.device_token,
          platform: token.platform,
          success: false,
          error: error.message,
        });
      }
    }

    // Log the notification
    const { error: logError } = await supabase
      .from('notification_logs')
      .insert({
        user_id: userId,
        title,
        body,
        data,
        results,
      });

    if (logError) {
      console.error('Error logging notification:', logError);
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        message: `Push notification sent to ${successCount}/${results.length} devices`,
        sent: successCount,
        total: results.length,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
