"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Filter, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { bookmarkWorkflowAPI, getWorkflowsAPI, unbookmarkWorkflowAPI } from "@/lib/api";

type WorkflowItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  useCase: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  tags: string[];
  stepCount: number;
  isBookmarked?: boolean;
  resumeStep?: { id: string; stepOrder: number; title: string } | null;
};

export default function WorkflowsPage() {
  const [loading, setLoading] = React.useState(true);
  const [workflows, setWorkflows] = React.useState<WorkflowItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [stack, setStack] = React.useState("all");
  const [difficulty, setDifficulty] = React.useState("all");
  const [useCase, setUseCase] = React.useState("all");
  const [bookmarkingId, setBookmarkingId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWorkflowsAPI({
        search: search || undefined,
        stack: stack !== "all" ? stack : undefined,
        difficulty: difficulty !== "all" ? difficulty : undefined,
        useCase: useCase !== "all" ? useCase : undefined,
        limit: 24,
      });
      setWorkflows(response.workflows || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, [search, stack, difficulty, useCase]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleBookmark = async (workflow: WorkflowItem) => {
    setBookmarkingId(workflow.id);
    try {
      if (workflow.isBookmarked) {
        await unbookmarkWorkflowAPI(workflow.id);
      } else {
        await bookmarkWorkflowAPI(workflow.id);
      }

      setWorkflows((prev) =>
        prev.map((item) =>
          item.id === workflow.id
            ? {
                ...item,
                isBookmarked: !item.isBookmarked,
              }
            : item
        )
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update bookmark");
    } finally {
      setBookmarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Workflow Library</h1>
        <p className="text-muted-foreground">
          Discover structured workflows and continue exactly where you left off.
        </p>
      </div>

      <Card className="border-border/80">
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={stack} onValueChange={setStack}>
              <SelectTrigger>
                <SelectValue placeholder="Stack" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stacks</SelectItem>
                <SelectItem value="nextjs">Next.js</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="node">Node</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any level</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger>
                  <SelectValue placeholder="Use case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any use case</SelectItem>
                  <SelectItem value="build">Build</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                  <SelectItem value="refactor">Refactor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={loadData}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No workflows found with current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="border-border/80">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl leading-tight">{workflow.title}</CardTitle>
                    <CardDescription className="mt-2">{workflow.summary}</CardDescription>
                  </div>
                  <Button
                    variant={workflow.isBookmarked ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleBookmark(workflow)}
                    disabled={bookmarkingId === workflow.id}
                  >
                    {bookmarkingId === workflow.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                    <span className="sr-only">Bookmark workflow</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{workflow.difficulty}</Badge>
                  <Badge variant="outline">{workflow.useCase}</Badge>
                  <Badge variant="outline">{workflow.stepCount} steps</Badge>
                  <Badge variant="outline">{workflow.estimatedMinutes} min</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {workflow.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link href={`/workflows/${workflow.slug}`} className="w-full">
                    <Button className="w-full">Open Workflow</Button>
                  </Link>
                  {workflow.resumeStep && (
                    <Link href={`/workflows/${workflow.slug}?resume=${workflow.resumeStep.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Resume
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
