"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  exportRoadmapAPI,
  generateRoadmapWeekAPI,
  getRoadmapByIdAPI,
  getRoadmapShareCardAPI,
  replanRoadmapAPI,
  setRoadmapTaskCompletionAPI,
} from "@/lib/api";

type RoadmapTask = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
};

type RoadmapWeek = {
  id: string;
  weekNumber: number;
  title: string;
  tasks: RoadmapTask[];
};

type RoadmapStats = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentWeekNumber: number;
  missedWeeks: number[];
  currentStreakDays: number;
  longestStreakDays: number;
  weekCompletionMap: Array<{
    weekNumber: number;
    title: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
};

type RoadmapDetails = {
  id: string;
  title: string;
  goal: string;
  weeks: RoadmapWeek[];
  workflow?: { id: string; title: string; slug: string } | null;
};

export default function RoadmapDetailsPage() {
  const params = useParams();
  const roadmapId = String(params.id || "");

  const [loading, setLoading] = React.useState(true);
  const [busyAction, setBusyAction] = React.useState<"generate" | "replan" | "export" | "share" | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = React.useState<string | null>(null);
  const [roadmap, setRoadmap] = React.useState<RoadmapDetails | null>(null);
  const [stats, setStats] = React.useState<RoadmapStats | null>(null);

  const loadRoadmap = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoadmapByIdAPI(roadmapId);
      setRoadmap(response.roadmap || null);
      setStats(response.stats || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to load roadmap details");
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  React.useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const toggleTask = async (task: RoadmapTask) => {
    if (!roadmap) return;

    setUpdatingTaskId(task.id);
    try {
      const data = await setRoadmapTaskCompletionAPI(roadmap.id, task.id, !task.isCompleted);
      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          weeks: prev.weeks.map((week) => ({
            ...week,
            tasks: week.tasks.map((item) =>
              item.id === task.id ? { ...item, isCompleted: !task.isCompleted } : item
            ),
          })),
        };
      });
      setStats(data.stats || stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleGenerateWeek = async () => {
    if (!roadmap) return;
    setBusyAction("generate");
    try {
      await generateRoadmapWeekAPI(roadmap.id);
      toast.success("New week generated");
      loadRoadmap();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate week");
    } finally {
      setBusyAction(null);
    }
  };

  const handleReplan = async () => {
    if (!roadmap) return;
    setBusyAction("replan");
    try {
      const data = await replanRoadmapAPI(roadmap.id);
      toast.success(data.movedTasks ? `Moved ${data.movedTasks} task(s)` : "Roadmap already on track");
      loadRoadmap();
    } catch (error: any) {
      toast.error(error.message || "Failed to re-plan roadmap");
    } finally {
      setBusyAction(null);
    }
  };

  const handleExport = async () => {
    if (!roadmap) return;
    setBusyAction("export");
    try {
      const data = await exportRoadmapAPI(roadmap.id, "markdown");
      await navigator.clipboard.writeText(data.content || "");
      toast.success("Roadmap markdown copied");
    } catch (error: any) {
      toast.error(error.message || "Failed to export roadmap");
    } finally {
      setBusyAction(null);
    }
  };

  const handleShare = async () => {
    if (!roadmap) return;
    setBusyAction("share");
    try {
      const data = await getRoadmapShareCardAPI(roadmap.id);
      await navigator.clipboard.writeText(data.shareText || "");
      toast.success("Share text copied");
    } catch (error: any) {
      toast.error(error.message || "Failed to build share text");
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!roadmap || !stats) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">Roadmap not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/roadmaps" className="hover:text-foreground">
          Roadmaps
        </Link>
        <span>/</span>
        <span>{roadmap.title}</span>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-3xl font-semibold tracking-tight">{roadmap.title}</CardTitle>
              <CardDescription className="mt-3 max-w-3xl text-base">{roadmap.goal}</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Week {stats.currentWeekNumber}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Completion</p>
              <p className="mt-2 text-2xl font-semibold">{stats.completionRate}%</p>
              <p className="text-xs text-muted-foreground">
                {stats.completedTasks}/{stats.totalTasks} tasks done
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Current streak</p>
              <p className="mt-2 text-2xl font-semibold">{stats.currentStreakDays}d</p>
              <p className="text-xs text-muted-foreground">Longest: {stats.longestStreakDays}d</p>
            </div>
            <div className="rounded-xl border border-border/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Missed weeks</p>
              <p className="mt-2 text-2xl font-semibold">{stats.missedWeeks.length}</p>
              <p className="text-xs text-muted-foreground">
                {stats.missedWeeks.length ? `Week ${stats.missedWeeks.join(", ")}` : "None"}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Weeks planned</p>
              <p className="mt-2 text-2xl font-semibold">{roadmap.weeks.length}</p>
              <p className="text-xs text-muted-foreground">Active execution window</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall progress</span>
              <span>{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleGenerateWeek} disabled={busyAction !== null}>
              {busyAction === "generate" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Target className="mr-2 h-4 w-4" />
              )}
              Generate Next Week
            </Button>
            <Button variant="outline" onClick={handleReplan} disabled={busyAction !== null}>
              {busyAction === "replan" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Re-plan Missed Weeks
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={busyAction !== null}>
              {busyAction === "export" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
            <Button variant="outline" onClick={handleShare} disabled={busyAction !== null}>
              {busyAction === "share" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy Share Text
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {roadmap.weeks.map((week) => (
          <Card key={week.id} className="border-border/80">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xl tracking-tight">Week {week.weekNumber}: {week.title}</CardTitle>
                <Badge variant="outline">
                  {week.tasks.filter((task) => task.isCompleted).length}/{week.tasks.length} done
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {week.tasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className="flex w-full items-start gap-3 rounded-xl border border-border/70 p-3 text-left transition-colors hover:bg-muted/40"
                  disabled={updatingTaskId === task.id}
                >
                  <div className="mt-0.5">
                    {updatingTaskId === task.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : task.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="block h-4 w-4 rounded-full border border-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
