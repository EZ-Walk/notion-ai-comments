import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquareText, Zap, Shield, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <MessageSquareText className="h-6 w-6" />
            <span>NotionAI Comments</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  AI-Powered Comments for Your Notion Workspace
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Supercharge your Notion documents with AI that responds to comments automatically. Save time and boost
                  productivity.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth">
                  <Button size="lg" className="h-12 px-8">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <MessageSquareText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Responses</h3>
                <p className="text-gray-500">
                  Our AI automatically responds to comments in your Notion documents, providing helpful information and
                  answers.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Easy Integration</h3>
                <p className="text-gray-500">
                  Set up in minutes with our simple Notion integration. No coding required.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Privacy First</h3>
                <p className="text-gray-500">Your data stays private. Use your own API key or our secure service.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to transform your Notion workflow?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl">
                  Join thousands of users who are saving time with AI-powered comments.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <MessageSquareText className="h-5 w-5" />
            <span>NotionAI Comments</span>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} NotionAI Comments. All rights reserved.</p>
          <nav className="flex gap-4 text-sm">
            <Link href="#" className="text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-gray-500 hover:underline">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

