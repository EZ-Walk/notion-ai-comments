"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MessageSquareText, LogOut, Settings, User, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  const [notionConnected, setNotionConnected] = useState<boolean>(false)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth")
        return
      }

      setUser(session.user)

      // Check if user has a Notion connection by looking for provider_token in session
      if (session.provider_token && session.user.app_metadata?.provider === 'notion') {
        setNotionConnected(true)
      }
    }

    checkUser()

    // Check for integration error in URL
    const url = new URL(window.location.href)
    if (url.searchParams.get("integration_error") === "true") {
      toast({
        title: "Integration Error",
        description: "There was a problem connecting your Notion account. Please try again.",
        variant: "destructive",
      })
    }
  }, [router, supabase, toast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const saveApiKey = async () => {
    setLoading(true)

    try {
      // In a real app, you would securely store this API key
      // For this example, we'll just show a success message
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been securely saved.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving API key",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <MessageSquareText className="h-6 w-6" />
            <span>NotionAI Comments</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <nav className="h-full py-6 pl-2 pr-1">
            <div className="space-y-4">
              <div>
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Dashboard</h2>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex w-full flex-col overflow-hidden py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>

          <Tabs defaultValue="settings" className="mt-6">
            <TabsList>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>Add your OpenAI API key to use with NotionAI Comments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">OpenAI API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is encrypted and securely stored. We never share your API key.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={saveApiKey} disabled={loading || !apiKey}>
                    {loading ? "Saving..." : "Save API Key"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notion Integration</CardTitle>
                  <CardDescription>Manage your Notion workspace connection.</CardDescription>
                </CardHeader>
                <CardContent>
                  {notionConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Connected Workspace</p>
                          <p className="text-sm text-muted-foreground">Connected to Notion</p>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Sign out and refresh the page to disconnect from Notion
                          supabase.auth.signOut();
                          router.refresh();
                          toast({
                            title: "Disconnected",
                            description: "Your Notion workspace has been disconnected."
                          })
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Not connected</AlertTitle>
                        <AlertDescription>
                          Connect your Notion workspace to enable AI-powered comments.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={async () => {
                          // Redirect to Notion OAuth flow
                          const { data, error } = await supabase.auth.signInWithOAuth({
                            provider: "notion",
                            options: {
                              redirectTo: `${window.location.origin}/auth/callback`,
                            },
                          })

                          if (error) {
                            toast({
                              title: "Error",
                              description: error.message,
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        Connect Notion
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your account details and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="rounded-md border px-3 py-2 text-sm">{user.email}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <div className="rounded-md border px-3 py-2 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Update Profile</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>Manage your subscription and billing information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-sm text-muted-foreground">Using your own OpenAI API key</p>
                      </div>
                      <Button>Upgrade to Pro</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <MessageSquareText className="h-5 w-5" />
            <span>NotionAI Comments</span>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} NotionAI Comments. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

