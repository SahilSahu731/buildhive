import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { ProofStrip } from "@/components/home/proof-strip"
import { CapabilityGrid } from "@/components/home/capability-grid"
import { WorkflowTimeline } from "@/components/home/workflow-timeline"
import { FinalCta } from "@/components/home/final-cta"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        <ProofStrip />
        <CapabilityGrid />
        <WorkflowTimeline />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
