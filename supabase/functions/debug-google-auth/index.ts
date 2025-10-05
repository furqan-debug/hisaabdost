import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { idToken, email, name } = await req.json()
    
    console.log('🔍 DEBUG: Received request')
    console.log('🔍 ID Token length:', idToken?.length || 0)
    console.log('🔍 Email:', email)
    console.log('🔍 Name:', name)
    console.log('🔍 ID Token preview:', idToken?.substring(0, 100))

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('🔍 Supabase URL:', supabaseUrl)
    console.log('🔍 Has service role key:', !!supabaseKey)

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to verify the token with Supabase
    console.log('🔍 Attempting signInWithIdToken...')
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })

    if (error) {
      console.error('🔴 Supabase auth error:', {
        message: error.message,
        status: error.status,
        code: error.code,
      })
      
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          errorCode: error.code,
          errorStatus: error.status,
          details: 'Token exchange with Supabase failed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('🟢 Supabase auth success!')
    console.log('🟢 User ID:', data.user?.id)
    console.log('🟢 User email:', data.user?.email)

    return new Response(
      JSON.stringify({
        success: true,
        userId: data.user?.id,
        userEmail: data.user?.email,
        sessionExists: !!data.session,
        message: 'Successfully authenticated with Google via debug function'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('🔴 Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Unexpected error in debug function'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
