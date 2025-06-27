
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID');
const FIREBASE_PRIVATE_KEY = Deno.env.get('FIREBASE_PRIVATE_KEY');
const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL');

// Function to create JWT for FCM v1 API
async function createJWT() {
  if (!FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PROJECT_ID) {
    throw new Error('Firebase credentials missing');
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600 // 1 hour
  };

  // Import private key
  const privateKeyPem = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKeyPem),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Create JWT
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${unsignedToken}.${encodedSignature}`;
}

// Function to get access token
async function getAccessToken() {
  const jwt = await createJWT();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

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

    // Get access token for FCM v1 API
    const accessToken = await getAccessToken();

    // Send notifications to all user's devices
    for (const tokenData of tokens) {
      try {
        if (tokenData.platform === 'android' || tokenData.platform === 'ios') {
          // Send FCM v1 notification
          const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                token: tokenData.token,
                notification: {
                  title,
                  body,
                },
                data: data || {},
                android: tokenData.platform === 'android' ? {
                  notification: {
                    icon: 'ic_notification',
                    sound: 'default',
                  }
                } : undefined,
                apns: tokenData.platform === 'ios' ? {
                  payload: {
                    aps: {
                      sound: 'default',
                    }
                  }
                } : undefined,
              }
            }),
          });

          const fcmResult = await fcmResponse.json();
          results.push({ 
            platform: tokenData.platform, 
            success: fcmResponse.ok, 
            result: fcmResult 
          });

          if (!fcmResponse.ok) {
            console.error(`FCM error for ${tokenData.platform}:`, fcmResult);
          }
        }
      } catch (error) {
        console.error(`Error sending notification to ${tokenData.platform}:`, error);
        results.push({ 
          platform: tokenData.platform, 
          success: false, 
          error: error.message 
        });
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
