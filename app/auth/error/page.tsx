"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MessageSquareText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  useEffect(() => {
    setError(searchParams.get("error") || "Unknown error")
    setDescription(searchParams.get("description") || "An error occurred during authentication.")
  }, [searchParams])

  // Map common OAuth error codes to user-friendly messages
  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      invalid_request: "The request is missing a required parameter or is otherwise malformed.",
      unauthorized_client: "The client is not authorized to request an access token using this method.",
      access_denied: "The resource owner or authorization server denied the request.",
      unsupported_response_type:
        "The authorization server does not support obtaining an access token using this method.",
      invalid_scope: "The requested scope is invalid, unknown, or malformed.",
      server_error: "The authorization server encountered an unexpected condition.",
      temporarily_unavailable: "The authorization server is currently unable to handle the request.",
      invalid_client: "Client authentication failed.",
      invalid_grant: "The authorization code is invalid or expired.",
      authentication_error: "There was a problem authenticating your account.",
    }

    return errorMessages[errorCode] || description || "An unknown error occurred."
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2 font-bold">
        <MessageSquareText className="h-6 w-6" />
        <span>NotionAI Comments</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>There was a problem signing you in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium">{error}</p>
            <p className="mt-2">{getErrorMessage(error)}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

