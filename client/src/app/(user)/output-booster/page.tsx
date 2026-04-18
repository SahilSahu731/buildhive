"use client";

import * as React from "react";
import {
  AlertTriangle,
  Clipboard,
  FileCode2,
  Loader2,
  Shield,
  TestTube2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  analyzeOutputAPI,
  compareOutputBoosterRunsAPI,
  getOutputBoosterHistoryAPI,
} from "@/lib/api";

type IssueSeverity = "LOW" | "MEDIUM" | "HIGH";
type IssueCategory = "READABILITY" | "TEST_GAPS" | "SECURITY";

type BoosterIssue = {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  detail: string;
  suggestion: string;
  copyablePrompt: string;
  lineHint?: number;
};

type BoosterSummary = {
  score: number;
  issueCount: number;
  countsBySeverity: Record<IssueSeverity, number>;
  countsByCategory: Record<IssueCategory, number>;
  groupedIssues: Record<IssueCategory, BoosterIssue[]>;
};

type BoosterRun = {
  runId: string;
  createdAt: string;
  fileName: string;
  language: string;
  sourceType: string;
  lineCount: number;
  summary: BoosterSummary;
  issues: BoosterIssue[];
  suggestedFixes: string[];
};

type CompareResponse = {
  baseline: {
    runId: string;
    createdAt: string;
    fileName: string;
    summary: BoosterSummary;
  };
  candidate: {
    runId: string;
    createdAt: string;
    fileName: string;
    summary: BoosterSummary;
  };
  delta: {
    score: number;
    issueCount: number;
    severity: Record<IssueSeverity, number>;
    category: Record<IssueCategory, number>;
  };
  interpretation: string;
};

const categoryMeta: Record<IssueCategory, { title: string; icon: React.ReactNode }> = {
  READABILITY: { title: "Readability", icon: <FileCode2 className="h-4 w-4" /> },
  TEST_GAPS: { title: "Test Gaps", icon: <TestTube2 className="h-4 w-4" /> },
  SECURITY: { title: "Security", icon: <Shield className="h-4 w-4" /> },
};

const severityClass: Record<IssueSeverity, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-amber-100 text-amber-900",
  HIGH: "bg-red-100 text-red-900",
};

export default function OutputBoosterPage() {
  const [content, setContent] = React.useState("");
  const [fileName, setFileName] = React.useState("snippet.ts");
  const [language, setLanguage] = React.useState("typescript");

  const [running, setRunning] = React.useState(false);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [compareLoading, setCompareLoading] = React.useState(false);

  const [report, setReport] = React.useState<BoosterRun | null>(null);
  const [history, setHistory] = React.useState<BoosterRun[]>([]);
  const [runA, setRunA] = React.useState("");
  const [runB, setRunB] = React.useState("");
  const [comparison, setComparison] = React.useState<CompareResponse | null>(null);

  const loadHistory = React.useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await getOutputBoosterHistoryAPI(20);
      const items = response.history || [];
      setHistory(items);

      if (!runA && items[1]?.runId) setRunA(items[1].runId);
      if (!runB && items[0]?.runId) setRunB(items[0].runId);
    } catch (error: any) {
      toast.error(error.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [runA, runB]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setContent(text);
      setFileName(file.name);

      if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) setLanguage("typescript");
      if (file.name.endsWith(".js") || file.name.endsWith(".jsx")) setLanguage("javascript");
      if (file.name.endsWith(".py")) setLanguage("python");
      if (file.name.endsWith(".go")) setLanguage("go");
      if (file.name.endsWith(".java")) setLanguage("java");
    } catch {
      toast.error("Could not read uploaded file");
    }
  };

  const runAnalysis = async (sourceType: "paste" | "upload") => {
    if (!content.trim()) {
      toast.error("Add code input before analyzing");
      return;
    }

    setRunning(true);
    try {
      const data = await analyzeOutputAPI({
        content,
        fileName,
        language,
        sourceType,
      });
      setReport(data);
      toast.success("Analysis complete");
      loadHistory();
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze output");
    } finally {
      setRunning(false);
    }
  };

  const runComparison = async () => {
    if (!runA || !runB) {
      toast.error("Select two runs to compare");
      return;
    }

    if (runA === runB) {
      toast.error("Pick two different runs");
      return;
    }

    setCompareLoading(true);
    try {
      const data = await compareOutputBoosterRunsAPI(runA, runB);
      setComparison(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to compare runs");
    } finally {
      setCompareLoading(false);
    }
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Prompt copied");
    } catch {
      toast.error("Could not copy prompt");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card px-6 py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Output Booster</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Analyze code quality before shipping</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Paste or upload code, run readability/test/security checks, and compare run-to-run quality changes.
        </p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="history">History & Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Code Input</CardTitle>
              <CardDescription>Supports paste and upload workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="File name" />
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" />
                <label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm hover:bg-muted/40">
                  <Upload className="mr-2 h-4 w-4" /> Upload file
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste code here"
                className="min-h-80 font-mono text-sm"
              />

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runAnalysis("paste")} disabled={running || !content.trim()}>
                  {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                  Run Booster Checks
                </Button>
                <Button variant="outline" onClick={() => runAnalysis("upload")} disabled={running || !content.trim()}>
                  Analyze as Uploaded File
                </Button>
              </div>
            </CardContent>
          </Card>

          {report && (
            <Card className="border-border/80">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Latest Report</CardTitle>
                    <CardDescription>
                      {report.fileName} • score {report.summary.score}/100 • {report.summary.issueCount} issue(s)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={severityClass.HIGH}>High: {report.summary.countsBySeverity.HIGH}</Badge>
                    <Badge className={severityClass.MEDIUM}>Medium: {report.summary.countsBySeverity.MEDIUM}</Badge>
                    <Badge className={severityClass.LOW}>Low: {report.summary.countsBySeverity.LOW}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(categoryMeta) as IssueCategory[]).map((category) => {
                  const items = report.summary.groupedIssues[category] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="rounded-xl border border-border/70 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        {categoryMeta[category].icon}
                        <p className="font-medium">{categoryMeta[category].title}</p>
                        <Badge variant="outline">{items.length}</Badge>
                      </div>

                      <div className="space-y-3">
                        {items.map((issue) => (
                          <div key={issue.id} className="rounded-lg border border-border/60 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">{issue.title}</p>
                              <Badge className={severityClass[issue.severity]}>{issue.severity}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{issue.detail}</p>
                            <p className="mt-2 text-sm">Fix: {issue.suggestion}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => copyPrompt(issue.copyablePrompt)}
                            >
                              <Clipboard className="mr-2 h-4 w-4" />
                              Copy AI Fix Prompt
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Run History</CardTitle>
              <CardDescription>Review previous analyses and pick two runs for side-by-side comparison.</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/80 p-10 text-center text-sm text-muted-foreground">
                  No runs yet. Analyze your code first.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      type="button"
                      key={item.runId}
                      className="w-full rounded-xl border border-border/70 p-4 text-left hover:bg-muted/40"
                      onClick={() => setReport(item)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{item.fileName}</p>
                        <Badge variant="outline">Score {item.summary?.score ?? 0}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()} • {item.language} • {item.lineCount} lines
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle>Compare Runs</CardTitle>
              <CardDescription>Measure improvements and regressions between two analysis runs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={runA}
                  onChange={(e) => setRunA(e.target.value)}
                >
                  <option value="">Select baseline run</option>
                  {history.map((item) => (
                    <option key={`a-${item.runId}`} value={item.runId}>
                      {item.fileName} - {new Date(item.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={runB}
                  onChange={(e) => setRunB(e.target.value)}
                >
                  <option value="">Select candidate run</option>
                  {history.map((item) => (
                    <option key={`b-${item.runId}`} value={item.runId}>
                      {item.fileName} - {new Date(item.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={runComparison} disabled={compareLoading || !runA || !runB}>
                {compareLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Compare Selected Runs
              </Button>

              {comparison && (
                <div className="rounded-xl border border-border/70 p-4">
                  <p className="font-medium">{comparison.interpretation}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs text-muted-foreground">Score delta</p>
                      <p className="text-xl font-semibold">{comparison.delta.score > 0 ? "+" : ""}{comparison.delta.score}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs text-muted-foreground">Issue delta</p>
                      <p className="text-xl font-semibold">{comparison.delta.issueCount > 0 ? "+" : ""}{comparison.delta.issueCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs text-muted-foreground">High severity delta</p>
                      <p className="text-xl font-semibold">{comparison.delta.severity.HIGH > 0 ? "+" : ""}{comparison.delta.severity.HIGH}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs text-muted-foreground">Security issue delta</p>
                      <p className="text-xl font-semibold">{comparison.delta.category.SECURITY > 0 ? "+" : ""}{comparison.delta.category.SECURITY}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
