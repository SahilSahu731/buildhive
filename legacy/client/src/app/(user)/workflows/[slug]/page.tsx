"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Bookmark, CheckCircle2, Circle, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  bookmarkWorkflowAPI,
  getWorkflowBySlugAPI,
  getWorkflowResumeStepAPI,
  setWorkflowStepCompletionAPI,
  unbookmarkWorkflowAPI,
} from "@/lib/api";

type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  promptHint?: string | null;
  stepOrder: number;
  isCompleted?: boolean;
};

type WorkflowDetails = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: string;
  useCase: string;
  estimatedMinutes: number;
  tags: string[];
  isBookmarked?: boolean;
  steps: WorkflowStep[];
  resumeStep?: { id: string; stepOrder: number; title: string } | null;
};

export default function WorkflowDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params.slug || "");

  const [loading, setLoading] = React.useState(true);
  const [updatingStepId, setUpdatingStepId] = React.useState<string | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = React.useState(false);
  const [workflow, setWorkflow] = React.useState<WorkflowDetails | null>(null);

  const loadWorkflow = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkflowBySlugAPI(slug);
      setWorkflow(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  React.useEffect(() => {
    const resumeId = searchParams.get("resume");
    if (resumeId && workflow?.steps?.length) {
      const el = document.getElementById(`step-${resumeId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchParams, workflow]);

  const toggleBookmark = async () => {
    if (!workflow) return;
    setBookmarkLoading(true);
    try {
      if (workflow.isBookmarked) {
        await unbookmarkWorkflowAPI(workflow.id);
        setWorkflow((prev) => (prev ? { ...prev, isBookmarked: false } : prev));
      } else {
        await bookmarkWorkflowAPI(workflow.id);
        setWorkflow((prev) => (prev ? { ...prev, isBookmarked: true } : prev));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const toggleStepComplete = async (step: WorkflowStep) => {
    if (!workflow) return;

    const nextState = !step.isCompleted;
    setUpdatingStepId(step.id);
    try {
      await setWorkflowStepCompletionAPI(workflow.id, step.id, nextState);
      setWorkflow((prev) =>
        prev
          ? {
              ...prev,
              steps: prev.steps.map((item) =>
                item.id === step.id ? { ...item, isCompleted: nextState } : item
              ),
            }
          : prev
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update step");
    } finally {
      setUpdatingStepId(null);
    }
  };

  const resumeWorkflow = async () => {
    if (!workflow) return;

    try {
      const data = await getWorkflowResumeStepAPI(workflow.id);
      const stepId = data?.resumeStep?.id;
      if (!stepId) {
        toast.message("No resume step available yet");
        return;
      }
      const el = document.getElementById(`step-${stepId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resume workflow");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          Workflow not found.
        </CardContent>
      </Card>
    );
  }

  const completedCount = workflow.steps.filter((step) => step.isCompleted).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/workflows" className="hover:text-foreground">
          Workflows
        </Link>
        <span>/</span>
        <span>{workflow.title}</span>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-3xl font-semibold tracking-tight">{workflow.title}</CardTitle>
              <CardDescription className="mt-3 max-w-3xl text-base leading-relaxed">
                {workflow.summary}
              </CardDescription>
            </div>
            <Button variant={workflow.isBookmarked ? "default" : "outline"} onClick={toggleBookmark}>
              {bookmarkLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bookmark className="mr-2 h-4 w-4" />
              )}
              {workflow.isBookmarked ? "Bookmarked" : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{workflow.difficulty}</Badge>
            <Badge variant="outline">{workflow.useCase}</Badge>
            <Badge variant="outline">{workflow.estimatedMinutes} min</Badge>
            <Badge variant="outline">
              {completedCount}/{workflow.steps.length} completed
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={resumeWorkflow}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Resume Last Step
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {workflow.steps.map((step) => (
          <Card key={step.id} id={`step-${step.id}`} className="border-border/80">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <button
                  className="mt-1"
                  onClick={() => toggleStepComplete(step)}
                  disabled={updatingStepId === step.id}
                >
                  {updatingStepId === step.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : step.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Step {step.stepOrder}</Badge>
                    <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  {step.promptHint && (
                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Prompt Hint</p>
                      <p className="mt-1 text-sm">{step.promptHint}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
