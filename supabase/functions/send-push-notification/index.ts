
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

// Function to generate JWT for FCM v1 API
async function generateAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, // 1 hour
    iat: now,
  };

  // Create JWT header and payload
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(jwt));
  
  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(serviceAccount.private_key.replace(/\\n/g, '\n')),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  const signedJWT = `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJWT,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
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

    const { userId, title, body, data, sendToAll }: PushNotificationRequest = await req.json();

    console.log('Processing push notification request:', { userId, sendToAll, title });

    // Check if Firebase service account is available
    const firebaseServiceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!firebaseServiceAccount) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Firebase Service Account not configured',
          message: 'Please set the FIREBASE_SERVICE_ACCOUNT environment variable in your Supabase project settings'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(firebaseServiceAccount);
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Firebase Service Account JSON',
          message: 'Please check the FIREBASE_SERVICE_ACCOUNT format in your Supabase project settings'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract project ID from service account
    const projectId = serviceAccount.project_id;
    if (!projectId) {
      console.error('❌ No project_id found in service account');
      return new Response(
        JSON.stringify({ 
          error: 'Missing project_id in service account',
          message: 'Please ensure your service account JSON contains the project_id field'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    // Generate access token for FCM v1 API
    let accessToken;
    try {
      accessToken = await generateAccessToken(serviceAccount);
      console.log('✅ Successfully generated FCM access token');
    } catch (error) {
      console.error('❌ Failed to generate FCM access token:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate FCM access token',
          message: error.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const results = [];
    let processedCount = 0;
    const errors = [];

    // Process tokens in batches for better performance
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tokens.length / BATCH_SIZE)}`);

      // Process each token in the current batch
      const batchPromises = batch.map(async (token) => {
        try {
          if (token.platform === 'android') {
            // Send FCM v1 notification for Android
            console.log(`Sending FCM v1 notification to user ${token.user_id}`);
            
            const fcmPayload = {
              message: {
                token: token.device_token,
                notification: {
                  title,
                  body,
                },
                data: data || {},
              }
            };

            console.log('FCM v1 Payload:', JSON.stringify(fcmPayload, null, 2));

            const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fcmPayload),
            });

            console.log('FCM Response status:', fcmResponse.status);
            console.log('FCM Response headers:', Object.fromEntries(fcmResponse.headers.entries()));

            const responseText = await fcmResponse.text();
            console.log('FCM Response text:', responseText.substring(0, 500));

            let fcmResult;
            try {
              fcmResult = JSON.parse(responseText);
            } catch (parseError) {
              console.error('❌ Failed to parse FCM response as JSON:', parseError);
              fcmResult = { 
                error: 'Invalid JSON response from FCM', 
                rawResponse: responseText.substring(0, 200),
                status: fcmResponse.status 
              };
            }

            processedCount++;

            const result = {
              token: token.device_token,
              platform: token.platform,
              user_id: token.user_id,
              success: fcmResponse.ok && !fcmResult.error,
              result: fcmResult,
            };

            if (fcmResponse.ok && !fcmResult.error) {
              console.log(`✅ FCM v1 notification sent successfully to user ${token.user_id}`);
            } else {
              console.error(`❌ FCM v1 notification failed for user ${token.user_id}:`, fcmResult);
              errors.push({ 
                user_id: token.user_id, 
                error: fcmResult.error || fcmResult,
                status: fcmResponse.status 
              });
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
            console.log(`⚠️ Unsupported platform for user ${token.user_id}: ${token.platform}`);
            return {
              token: token.device_token,
              platform: token.platform,
              user_id: token.user_id,
              success: false,
              error: 'Unsupported platform',
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
        user_id: sendToAll || !userId ? null : userId,
        title,
        body,
        data,
        results: {
          total_tokens: tokens.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
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
        results: results.slice(0, 5), // Return first 5 results as sample
        fcm_v1_api_used: true
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
