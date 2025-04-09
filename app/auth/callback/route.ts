import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log('[AUTH CALLBACK] Received callback request', {
    timestamp: new Date().toISOString(),
    hasCode: !!code,
    hasError: !!error,
    url: request.url.split('?')[0] // Log URL without query params for security
  })

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  // Create a service role client for operations that need to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  // Handle OAuth errors
  if (error) {
    console.error(`OAuth Error: ${error}`, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/error?error=${error}&description=${errorDescription || ""}`, request.url),
    )
  }

  if (code) {
    try {
      // Exchange code for session
      const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) throw authError

      // Check if this is a Notion OAuth flow by looking for notion provider in session
      const provider = authData.session?.user?.app_metadata?.provider

      if (provider === "notion") {
        console.log('[AUTH CALLBACK] Detected Notion provider, extracting token from session')
        // Extract Notion token information from Supabase session
        try {
          // Get provider token from Supabase session
          const { data: providerData, error: providerError } = await supabase.auth.getSession()
          
          if (providerError) throw providerError
          
          // Log the complete user metadata and provider token data from Notion
          console.log('[AUTH CALLBACK] Complete Notion OAuth response data:', {
            user_metadata: providerData.session?.user?.user_metadata,
            provider_token_data: {
              provider_token: providerData.session?.provider_token ? '[REDACTED]' : undefined,
              provider_refresh_token: providerData.session?.provider_refresh_token ? '[REDACTED]' : undefined,
              expires_at: providerData.session?.expires_at,
              expires_in: providerData.session?.expires_in
            },
            raw_app_metadata: providerData.session?.user?.app_metadata
          })
          
          // Extract Notion access token and other details from provider token
          const notionToken = providerData.session?.provider_token
          const notionRefreshToken = providerData.session?.provider_refresh_token
          
          // Extract the Notion user ID from user_metadata
          const notionUserId = providerData.session?.user?.user_metadata?.provider_id
          
          if (!notionToken) {
            throw new Error("Failed to retrieve access token from Notion via Supabase")
          }
          
          console.log('[AUTH CALLBACK] Successfully retrieved Notion token and user ID', {
            hasToken: !!notionToken,
            hasRefreshToken: !!notionRefreshToken,
            notionUserId
          })
          
          // Store the Notion user ID and initialize/update user subscription
          try {
            const userId = providerData.session?.user?.id
            
            if (userId) {
              // First check if the user already has a subscription
              const { data: existingSubscription, error: checkError } = await supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('user_id', userId)
                .single()
              
              let upsertError = null
              
              if (!existingSubscription) {
                // Create new subscription for new users with Notion user ID
                const { error } = await supabaseAdmin
                  .from('subscriptions')
                  .insert({
                    user_id: userId,
                    notion_user_id: notionUserId,  // Include the Notion user ID
                    token_limit: 10000,
                    tokens_consumed: 0,
                    tier: 'free',
                    access_token: notionToken,  // Store the Notion provider token
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                upsertError = error
                
                if (error) {
                  console.error('[AUTH CALLBACK] Error creating subscription with Notion user ID:', error)
                } else {
                  console.log('[AUTH CALLBACK] Successfully created subscription with Notion user ID and token', {
                    hasToken: !!notionToken,
                    tokenLength: notionToken ? notionToken.length : 0
                  })
                }
              } else {
                // Update existing subscription with Notion user ID and token limit
                const { error } = await supabaseAdmin
                  .from('subscriptions')
                  .update({
                    notion_user_id: notionUserId,  // Include the Notion user ID
                    token_limit: 10000,
                    tier: 'free',
                    access_token: notionToken,  // Update the Notion provider token
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', userId)
                upsertError = error
                
                if (error) {
                  console.error('[AUTH CALLBACK] Error updating subscription with Notion user ID:', error)
                } else {
                  console.log('[AUTH CALLBACK] Successfully updated subscription with Notion user ID and token', {
                    hasToken: !!notionToken,
                    tokenLength: notionToken ? notionToken.length : 0
                  })
                }
              }
            }
          } catch (subscriptionError) {
            console.error('[AUTH CALLBACK] Error managing subscription:', subscriptionError)
          }

          console.log('[AUTH CALLBACK] Successfully authenticated with Notion')
        } catch (integrationError: any) {
          console.error("[AUTH CALLBACK] Integration error:", {
            message: integrationError.message,
            stack: integrationError.stack,
            timestamp: new Date().toISOString()
          })
          // Continue to dashboard but we'll show an error there
          return NextResponse.redirect(new URL("/dashboard?integration_error=true", request.url))
        }
      }
    } catch (error: any) {
      console.error("[AUTH CALLBACK] Authentication error:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
      return NextResponse.redirect(
        new URL(`/auth/error?error=authentication_error&description=${error.message}`, request.url),
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", request.url))
}



