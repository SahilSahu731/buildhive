"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createRoadmapAPI, getRoadmapsAPI } from "@/lib/api";

type RoadmapStats = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentWeekNumber: number;
  missedWeeks: number[];
  currentStreakDays: number;
};

type RoadmapItem = {
  id: string;
  title: string;
  goal: string;
  isActive: boolean;
  weeks: { id: string; weekNumber: number }[];
  workflow?: { id: string; title: string; slug: string } | null;
  stats: RoadmapStats;
};

const FOCUS_OPTIONS = ["Planning", "Building", "Quality", "Testing", "Shipping"];

export default function RoadmapsPage() {
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [roadmaps, setRoadmaps] = React.useState<RoadmapItem[]>([]);

  const [title, setTitle] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [durationWeeks, setDurationWeeks] = React.useState("8");
  const [preferredStack, setPreferredStack] = React.useState("");
  const [selectedFocus, setSelectedFocus] = React.useState<string[]>(["Building", "Quality"]);

  const loadRoadmaps = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoadmapsAPI();
      setRoadmaps(response.roadmaps || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load roadmaps");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRoadmaps();
  }, [loadRoadmaps]);

  const toggleFocus = (focus: string) => {
    setSelectedFocus((prev) =>
      prev.includes(focus) ? prev.filter((item) => item !== focus) : [...prev, focus]
    );
  };

  const handleCreateRoadmap = async () => {
    if (!goal.trim()) {
      toast.error("Please add a goal for your roadmap");
      return;
    }

    setSubmitting(true);
    try {
      await createRoadmapAPI({
        title: title.trim() || undefined,
        goal: goal.trim(),
        durationWeeks: Number(durationWeeks) || 8,
        preferredStack: preferredStack.trim() || undefined,
        focusAreas: selectedFocus,
      });

      toast.success("Roadmap generated");
      setTitle("");
      setGoal("");
      setDurationWeeks("8");
      setPreferredStack("");
      setSelectedFocus(["Building", "Quality"]);
      loadRoadmaps();
    } catch (error: any) {
      toast.error(error.message || "Failed to create roadmap");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Roadmap Engine</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build your execution roadmap</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Create a realistic weekly roadmap, track streaks, and re-plan missed weeks without losing momentum.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Weekly AI planning
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1.6fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5" />
              Roadmap Setup Wizard
            </CardTitle>
            <CardDescription>
              Define your goal once and generate a full weekly task plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Roadmap title</p>
              <Input
                placeholder="Example: Launch my first SaaS MVP"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Goal</p>
              <Textarea
                placeholder="What are you trying to achieve over the next few weeks?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Duration (weeks)</p>
                <Input
                  type="number"
                  min={2}
                  max={16}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Preferred stack</p>
                <Input
                  placeholder="Next.js, Node, Python..."
                  value={preferredStack}
                  onChange={(e) => setPreferredStack(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Focus areas</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((focus) => {
                  const active = selectedFocus.includes(focus);
                  return (
                    <Button
                      key={focus}
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFocus(focus)}
                    >
                      {focus}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button className="w-full" onClick={handleCreateRoadmap} disabled={submitting || !goal.trim()}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Generate Weekly Roadmap
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl">Your Roadmaps</CardTitle>
            <CardDescription>Open any roadmap to track tasks, streaks, and weekly progress.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-10 text-center">
                <p className="text-sm text-muted-foreground">No roadmaps yet. Generate your first one using the wizard.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmaps.map((roadmap) => (
                  <div key={roadmap.id} className="rounded-xl border border-border/80 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-medium tracking-tight">{roadmap.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{roadmap.goal}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">Week {roadmap.stats.currentWeekNumber}</Badge>
                          <Badge variant="outline">{roadmap.weeks.length} weeks</Badge>
                          <Badge variant="secondary">{roadmap.stats.currentStreakDays} day streak</Badge>
                          {roadmap.workflow && <Badge variant="outline">Workflow: {roadmap.workflow.title}</Badge>}
                        </div>
                      </div>

                      <Link href={`/roadmaps/${roadmap.id}`}>
                        <Button size="sm">Open</Button>
                      </Link>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {roadmap.stats.completedTasks}/{roadmap.stats.totalTasks} tasks completed
                        </span>
                        <span>{roadmap.stats.completionRate}%</span>
                      </div>
                      <Progress value={roadmap.stats.completionRate} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
