import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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
        // Exchange the authorization code for an access token with Notion
        try {
          const tokenResponse = await exchangeNotionToken(code, request.url)

          if (!tokenResponse.access_token) {
            throw new Error("Failed to retrieve access token from Notion")
          }

          // Save the integration data to Supabase
          const { error: dbError } = await supabase.from("integrations").upsert(
            {
              user_id: authData.session.user.id,
              provider: "notion",
              access_token: tokenResponse.access_token,
              workspace_id: tokenResponse.workspace_id,
              workspace_name: tokenResponse.workspace_name,
              workspace_icon: tokenResponse.workspace_icon,
              bot_id: tokenResponse.bot_id,
              token_type: tokenResponse.token_type,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: "active",
            },
            {
              onConflict: "user_id,provider",
            },
          )

          if (dbError) throw dbError
        } catch (integrationError: any) {
          console.error("Integration error:", integrationError)
          // Continue to dashboard but we'll show an error there
          return NextResponse.redirect(new URL("/dashboard?integration_error=true", request.url))
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
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
  const redirectUri = new URL("/auth/callback", requestUrl).toString()
  const encoded = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64")

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
      throw new Error(errorData.error_description || "Failed to exchange token")
    }

    return await response.json()
  } catch (error) {
    console.error("Token exchange error:", error)
    throw error
  }
}

