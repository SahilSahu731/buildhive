import { Card } from "@/components/ui/card";

const CAPABILITIES = [
  {
    title: "Goal Mapping",
    body: "Convert ideas into step-by-step goals with clear next actions.",
  },
  {
    title: "Prompt Packs",
    body: "Use reusable prompts for code, writing, design, and planning tasks.",
  },
  {
    title: "Weekly Roadmaps",
    body: "Get realistic, trackable plans based on your pace and context.",
  },
  {
    title: "Execution Log",
    body: "Capture wins, blockers, and momentum in one continuous stream.",
  },
  {
    title: "Usage Signals",
    body: "See where your effort goes and which workflows deliver output.",
  },
  {
    title: "Calm Workspace",
    body: "A minimal interface with structure, not noise and distraction.",
  },
];

export function CapabilityGrid() {
  return (
    <section id="features" className="border-b border-border/70">
      <div className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Capabilities</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">One platform, many workflows</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item, index) => (
            <Card
              key={item.title}
              className="animate-rise rounded-2xl border-border/80 bg-background p-5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
