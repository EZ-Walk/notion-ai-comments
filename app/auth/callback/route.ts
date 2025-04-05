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
          
          // Extract Notion access token and other details from provider token
          const notionToken = providerData.session?.provider_token
          const notionRefreshToken = providerData.session?.provider_refresh_token
          
          if (!notionToken) {
            throw new Error("Failed to retrieve access token from Notion via Supabase")
          }
          
          console.log('[AUTH CALLBACK] Successfully retrieved Notion token from Supabase session', {
            hasToken: !!notionToken,
            hasRefreshToken: !!notionRefreshToken
          })
          
          // Fetch workspace information from Notion API
          try {
            const workspaceResponse = await fetch('https://api.notion.com/v1/users/me', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Notion-Version': '2022-06-28'
              }
            })
            
            if (!workspaceResponse.ok) {
              console.error('[AUTH CALLBACK] Failed to fetch workspace info', {
                status: workspaceResponse.status,
                statusText: workspaceResponse.statusText
              })
            } else {
              const workspaceData = await workspaceResponse.json()
              console.log('[AUTH CALLBACK] Fetched workspace info', {
                name: workspaceData.name,
                userId: workspaceData.id,
                type: workspaceData.type,
                botId: workspaceData.bot?.id
              })
            }
          } catch (workspaceError) {
            console.error('[AUTH CALLBACK] Error fetching workspace info', workspaceError)
          }
          
          // Initialize or update user subscription with free tier token limit
          try {
            const userId = providerData.session?.user?.id
            
            if (userId) {
              // First check if the user already has a subscription
              const { data: existingSubscription, error: checkError } = await supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('user_id', userId)
                .single()
              
              if (checkError && checkError.code !== 'PGRST116') {
                // Error other than "no rows returned"
                console.error('[AUTH CALLBACK] Error checking for existing subscription:', checkError)
              }
              
              let upsertError = null
              
              if (!existingSubscription) {
                // Create new subscription for new users
                const { error } = await supabaseAdmin
                  .from('subscriptions')
                  .insert({
                    user_id: userId,
                    token_limit: 10000,
                    tokens_consumed: 0,
                    tier: 'free'
                  })
                upsertError = error
              } else {
                // Update existing subscription for existing users
                const { error } = await supabaseAdmin
                  .from('subscriptions')
                  .update({
                    token_limit: 10000,
                    tier: 'free',
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', userId)
                upsertError = error
              }
              
              if (upsertError) {
                console.error('[AUTH CALLBACK] Error updating subscription:', upsertError)
              } else {
                console.log('[AUTH CALLBACK] Successfully updated subscription with 10,000 token limit')
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

// Function to exchange the authorization code for an access token with Notion
async function exchangeNotionToken(code: string, requestUrl: string) {
  // Extract origin from the request URL and construct a consistent redirect URI
  const origin = new URL(requestUrl).origin
  const redirectUri = `${origin}/auth/callback`
  const encoded = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64")
  
  console.log('[TOKEN EXCHANGE] Attempting to exchange code for token', {
    timestamp: new Date().toISOString(),
    codeLength: code,
    redirectUri,
    hasClientId: !!process.env.NOTION_CLIENT_ID,
    hasClientSecret: !!process.env.NOTION_CLIENT_SECRET
  })

  try {
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[TOKEN EXCHANGE] Failed to exchange token', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        errorDescription: errorData.error_description,
        fullErrorData: JSON.stringify(errorData),
        requestBody: JSON.stringify({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        })
      })
      throw new Error(errorData.error_description || "Failed to exchange token")
    }
    
    const tokenData = await response.json()
    console.log('[TOKEN EXCHANGE] Successfully exchanged code for token', {
      timestamp: new Date().toISOString(),
      success: true,
      hasAccessToken: !!tokenData.access_token,
      workspaceId: tokenData.workspace_id
    })
    return tokenData

  } catch (error) {
    console.error("[TOKEN EXCHANGE] Error during token exchange:", error)
    throw error
  }
}

