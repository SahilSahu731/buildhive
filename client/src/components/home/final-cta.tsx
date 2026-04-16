import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCta() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <Card className="rounded-3xl border-border/80 bg-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Start now</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Build your next milestone with clarity, not chaos.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Join vibeship and turn scattered work into an intentional execution system.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-7">Create Account</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-7">I already have an account</Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
