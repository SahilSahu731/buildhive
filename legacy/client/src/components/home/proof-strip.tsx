const PROOF_POINTS = [
  "Built for all skill levels",
  "No noisy dashboards",
  "Workflow-first execution",
  "Fast onboarding",
  "Human-readable planning",
];

export function ProofStrip() {
  return (
    <section className="border-b border-border/70 bg-card">
      <div className="container mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {PROOF_POINTS.map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
