
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  userId?: string; // Optional - if not provided, sends to all users
  title: string;
  body: string;
  data?: Record<string, any>;
  sendToAll?: boolean; // New flag to explicitly send to all users
}

const BATCH_SIZE = 50; // Process tokens in batches to avoid overwhelming the system

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

    const { userId, title, body, data, sendToAll }: PushNotificationRequest = await req.json();

    console.log('Processing push notification request:', { userId, sendToAll, title });

    let tokens;
    let tokensError;

    if (sendToAll || !userId) {
      // Fetch all device tokens from all users
      console.log('Fetching all device tokens for broadcast notification');
      const result = await supabase
        .from('user_device_tokens')
        .select('device_token, platform, user_id');
      tokens = result.data;
      tokensError = result.error;
    } else {
      // Fetch tokens for specific user (existing behavior)
      console.log('Fetching device tokens for user:', userId);
      const result = await supabase
        .from('user_device_tokens')
        .select('device_token, platform, user_id')
        .eq('user_id', userId);
      tokens = result.data;
      tokensError = result.error;
    }

    if (tokensError) {
      console.error('Error fetching device tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      const message = sendToAll || !userId 
        ? 'No device tokens found in the system' 
        : `No device tokens found for user: ${userId}`;
      console.log(message);
      return new Response(
        JSON.stringify({ message, sent: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${tokens.length} device tokens to process`);

    const results = [];
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY');
    let processedCount = 0;
    const errors = [];

    // Process tokens in batches for better performance
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tokens.length / BATCH_SIZE)}`);

      // Process each token in the current batch
      const batchPromises = batch.map(async (token) => {
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
            processedCount++;

            const result = {
              token: token.device_token,
              platform: token.platform,
              user_id: token.user_id,
              success: fcmResponse.ok,
              result: fcmResult,
            };

            if (fcmResponse.ok) {
              console.log(`✅ FCM notification sent successfully to user ${token.user_id}`);
            } else {
              console.error(`❌ FCM notification failed for user ${token.user_id}:`, fcmResult);
              errors.push({ user_id: token.user_id, error: fcmResult });
            }

            return result;
          } else if (token.platform === 'ios') {
            // iOS push notifications would be handled here with APNs
            console.log(`⚠️ iOS push notifications not yet configured for user ${token.user_id}`);
            return {
              token: token.device_token,
              platform: token.platform,
              user_id: token.user_id,
              success: false,
              error: 'iOS not configured',
            };
          } else {
            console.log(`⚠️ Unsupported platform or missing server key for user ${token.user_id}`);
            return {
              token: token.device_token,
              platform: token.platform,
              user_id: token.user_id,
              success: false,
              error: 'Unsupported platform or missing server key',
            };
          }
        } catch (error) {
          console.error(`❌ Error sending to token ${token.device_token} for user ${token.user_id}:`, error);
          errors.push({ user_id: token.user_id, token: token.device_token, error: error.message });
          return {
            token: token.device_token,
            platform: token.platform,
            user_id: token.user_id,
            success: false,
            error: error.message,
          };
        }
      });

      // Wait for current batch to complete before processing next batch
      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch processing error:', result.reason);
          errors.push({ error: result.reason });
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Log the notification to database
    try {
      const logData = {
        user_id: userId || 'broadcast', // Use 'broadcast' for system-wide notifications
        title,
        body,
        data,
        results: {
          total_tokens: tokens.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Log first 10 errors
        },
      };

      const { error: logError } = await supabase
        .from('notification_logs')
        .insert(logData);

      if (logError) {
        console.error('Error logging notification:', logError);
      }
    } catch (logError) {
      console.error('Failed to log notification:', logError);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`📊 Notification summary: ${successCount} successful, ${failureCount} failed out of ${tokens.length} total`);

    if (errors.length > 0) {
      console.error(`⚠️ ${errors.length} errors occurred during processing`);
    }

    return new Response(
      JSON.stringify({ 
        message: sendToAll || !userId 
          ? `Broadcast notification sent to ${successCount}/${tokens.length} devices`
          : `Push notification sent to ${successCount}/${tokens.length} devices`,
        sent: successCount,
        failed: failureCount,
        total: tokens.length,
        errors: errors.length,
        batch_size: BATCH_SIZE,
        results: results.slice(0, 5) // Return first 5 results as sample
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
