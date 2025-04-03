import Link from "next/link"
import { Check, MessageSquareText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <MessageSquareText className="h-6 w-6" />
            <span>NotionAI Comments</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Choose the plan that's right for you and start supercharging your Notion workspace today.
                </p>
              </div>
            </div>

            <div className="grid gap-6 pt-12 lg:grid-cols-2 lg:gap-12">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Use your own OpenAI API key</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold">$0</div>
                  <p className="text-sm text-gray-500">Forever free</p>

                  <ul className="mt-6 space-y-2">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Full access to AI comment responses</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Unlimited documents</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Use your own OpenAI API key</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Basic support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth" className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="flex flex-col border-primary">
                <CardHeader>
                  <CardTitle>Pro Plan</CardTitle>
                  <CardDescription>For users who want convenience</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold">$10</div>
                  <p className="text-sm text-gray-500">per month</p>

                  <ul className="mt-6 space-y-2">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Everything in Free plan</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>No API key required</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Advanced AI models</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>Custom AI training</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth" className="w-full">
                    <Button className="w-full" variant="default">
                      Subscribe
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="text-left">
                  <h3 className="font-bold">How does the API key option work?</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    With the free plan, you provide your own OpenAI API key. We never store your key on our servers -
                    it's encrypted and only used for your requests.
                  </p>
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Can I switch between plans?</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Yes, you can upgrade or downgrade your plan at any time from your dashboard.
                  </p>
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Is there a usage limit?</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Free plan users are limited by their OpenAI API usage limits. Pro plan users get generous usage
                    included in their subscription.
                  </p>
                </div>
                <div className="text-left">
                  <h3 className="font-bold">How do I get started?</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sign up for an account, connect your Notion workspace, and you're ready to go!
                  </p>
                </div>
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

