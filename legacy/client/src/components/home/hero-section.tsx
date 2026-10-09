import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="border-b border-border/70">
      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <p className="animate-rise text-xs uppercase tracking-[0.2em] text-muted-foreground">vibeship</p>
        <h1 className="animate-rise-delay-1 mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Think clearly.
          <br />
          Build calmly.
          <br />
          Ship with confidence.
        </h1>
        <p className="animate-rise-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          A focused workspace for creators, developers, freelancers, and teams who want structure without friction.
          vibeship turns ideas into practical weekly execution.
        </p>

        <div className="animate-rise-delay-3 mt-10 flex flex-wrap items-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-7">
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="rounded-full px-7">
              Explore Plans
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
