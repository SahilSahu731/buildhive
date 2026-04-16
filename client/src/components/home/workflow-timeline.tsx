import { Card } from "@/components/ui/card";

const STEPS = [
  {
    step: "01",
    title: "Choose your direction",
    text: "Pick what matters this week: shipping, learning, growth, or consistency.",
  },
  {
    step: "02",
    title: "Run a focused workflow",
    text: "Follow structured steps and prompts matched to your goal and level.",
  },
  {
    step: "03",
    title: "Track and improve",
    text: "Review progress, capture outcomes, and reuse what worked.",
  },
];

export function WorkflowTimeline() {
  return (
    <section id="how-it-works" className="border-b border-border/70 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Process</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Simple flow, serious output</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((item, index) => (
            <Card
              key={item.step}
              className="animate-rise rounded-2xl border-border/80 bg-card p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="font-mono text-xs text-muted-foreground">{item.step}</p>
              <h3 className="mt-3 text-xl font-medium tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
