
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="border-b">
          <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">VibeShip</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              Vibe code faster. Ship cleaner. Learn what actually works.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              VibeShip is an AI workflow service for developers who want better output in less time. Follow proven build workflows, use prompt packs that reduce trial-and-error, and stay on track with a practical roadmap.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Start Free</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">See Pricing</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="border-b">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold md:text-3xl">Everything to build better with AI</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-5">
                <h3 className="font-semibold">Workflow Library</h3>
                <p className="mt-2 text-sm text-muted-foreground">Step-by-step execution plans for common web app tasks.</p>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold">Prompt Packs</h3>
                <p className="mt-2 text-sm text-muted-foreground">Ready-to-use prompts tailored for coding, debugging, and refactoring.</p>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold">AI Roadmaps</h3>
                <p className="mt-2 text-sm text-muted-foreground">Weekly plans that align your learning with real project output.</p>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold">Output Booster</h3>
                <p className="mt-2 text-sm text-muted-foreground">Catch weak spots in generated code before you push to production.</p>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold">Execution Dashboard</h3>
                <p className="mt-2 text-sm text-muted-foreground">Continue where you left off, track progress, and avoid context switching.</p>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold">Team-Ready Structure</h3>
                <p className="mt-2 text-sm text-muted-foreground">Use standards and checklists so teams ship with consistency.</p>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold md:text-3xl">How it works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1</p>
                <h3 className="mt-2 font-semibold">Choose your build goal</h3>
                <p className="mt-2 text-sm text-muted-foreground">Pick what you want to ship this week and select a matching workflow.</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2</p>
                <h3 className="mt-2 font-semibold">Run better prompts</h3>
                <p className="mt-2 text-sm text-muted-foreground">Use prompt packs designed for your stack and task type.</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 3</p>
                <h3 className="mt-2 font-semibold">Ship with quality checks</h3>
                <p className="mt-2 text-sm text-muted-foreground">Review your output and fix risky areas before release.</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <Card className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-semibold">Build with AI, without the chaos</h2>
                <p className="mt-2 text-sm text-muted-foreground">Start with free workflows and upgrade when your speed and standards need more.</p>
              </div>
              <div className="flex gap-3">
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Open Dashboard</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
