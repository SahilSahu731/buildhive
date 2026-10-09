"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Copy, Heart, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getPromptPackBySlugAPI,
  togglePromptTemplateFavoriteAPI,
  trackPromptTemplateUsageAPI,
} from "@/lib/api";

type PromptTemplateItem = {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  variables?: unknown;
  goodExample?: string | null;
  badExample?: string | null;
  isFavorite?: boolean;
  usageCount?: number;
  myUsageCount?: number;
};

type PromptPackDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  targetTool: string;
  tags: string[];
  workflow?: { id: string; title: string; slug: string } | null;
  templates: PromptTemplateItem[];
};

function parseVariables(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function renderPrompt(content: string, values: Record<string, string>) {
  return content.replace(/\{([^}]+)\}/g, (_, key) => values[key] || `{${key}}`);
}

export default function PromptPackDetailsPage() {
  const params = useParams();
  const slug = String(params.slug || "");

  const [loading, setLoading] = React.useState(true);
  const [pack, setPack] = React.useState<PromptPackDetails | null>(null);
  const [templateValues, setTemplateValues] = React.useState<Record<string, Record<string, string>>>({});
  const [activePreviewId, setActivePreviewId] = React.useState<string | null>(null);
  const [copyingId, setCopyingId] = React.useState<string | null>(null);
  const [favoritingId, setFavoritingId] = React.useState<string | null>(null);

  const loadPack = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromptPackBySlugAPI(slug);
      setPack(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load prompt pack");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    loadPack();
  }, [loadPack]);

  const updateVariable = (templateId: string, key: string, value: string) => {
    setTemplateValues((prev) => ({
      ...prev,
      [templateId]: {
        ...(prev[templateId] || {}),
        [key]: value,
      },
    }));
  };

  const handleRenderPreview = async (templateId: string) => {
    setActivePreviewId(templateId);
    try {
      await trackPromptTemplateUsageAPI(templateId, "RENDER");
      setPack((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          templates: prev.templates.map((item) =>
            item.id === templateId
              ? {
                  ...item,
                  usageCount: (item.usageCount || 0) + 1,
                  myUsageCount: (item.myUsageCount || 0) + 1,
                }
              : item
          ),
        };
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to track render usage");
    } finally {
      setActivePreviewId(null);
    }
  };

  const handleCopy = async (template: PromptTemplateItem) => {
    const values = templateValues[template.id] || {};
    const text = renderPrompt(template.content, values);
    setCopyingId(template.id);

    try {
      await navigator.clipboard.writeText(text);
      await trackPromptTemplateUsageAPI(template.id, "COPY");
      setPack((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          templates: prev.templates.map((item) =>
            item.id === template.id
              ? {
                  ...item,
                  usageCount: (item.usageCount || 0) + 1,
                  myUsageCount: (item.myUsageCount || 0) + 1,
                }
              : item
          ),
        };
      });
      toast.success("Prompt copied");
    } catch (error: any) {
      toast.error(error.message || "Failed to copy prompt");
    } finally {
      setCopyingId(null);
    }
  };

  const toggleFavorite = async (templateId: string) => {
    setFavoritingId(templateId);
    try {
      const data = await togglePromptTemplateFavoriteAPI(templateId);
      setPack((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          templates: prev.templates.map((item) =>
            item.id === templateId
              ? {
                  ...item,
                  isFavorite: data.isFavorite,
                }
              : item
          ),
        };
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorite");
    } finally {
      setFavoritingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pack) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">Prompt pack not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/prompt-packs" className="hover:text-foreground">
          Prompt Packs
        </Link>
        <span>/</span>
        <span>{pack.name}</span>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tight">{pack.name}</CardTitle>
          <CardDescription className="mt-2 max-w-3xl text-base">{pack.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{pack.targetTool}</Badge>
            {pack.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          {pack.workflow && (
            <p className="text-sm text-muted-foreground">
              Related workflow: <Link href={`/workflows/${pack.workflow.slug}`} className="underline">{pack.workflow.title}</Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {pack.templates.map((template) => {
          const variables = parseVariables(template.variables);
          const values = templateValues[template.id] || {};
          const rendered = renderPrompt(template.content, values);

          return (
            <Card key={template.id} className="border-border/80">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    {template.description && <CardDescription className="mt-2">{template.description}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={template.isFavorite ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFavorite(template.id)}
                      disabled={favoritingId === template.id}
                    >
                      {favoritingId === template.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="mr-2 h-4 w-4" />
                      )}
                      {template.isFavorite ? "Favorited" : "Favorite"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(template)}
                      disabled={copyingId === template.id}
                    >
                      {copyingId === template.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Usage</p>
                    <p className="mt-2 text-sm">Total uses: {template.usageCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Your uses: {template.myUsageCount || 0}</p>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Good vs Bad</p>
                    <p className="mt-2 text-xs text-green-700">Good: {template.goodExample || "No example yet"}</p>
                    <p className="mt-2 text-xs text-red-700">Bad: {template.badExample || "No example yet"}</p>
                  </div>
                </div>

                {variables.length > 0 && (
                  <div className="space-y-3 rounded-lg border border-border/70 p-4">
                    <p className="text-sm font-medium">Template Variables</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {variables.map((key) => (
                        <div key={key} className="space-y-1">
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <Input
                            value={values[key] || ""}
                            onChange={(e) => updateVariable(template.id, key, e.target.value)}
                            placeholder={`Enter ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRenderPreview(template.id)}
                      disabled={activePreviewId === template.id}
                    >
                      {activePreviewId === template.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Render Preview
                    </Button>
                  </div>
                )}

                <div className="rounded-lg border border-border/70 bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Rendered Preview</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{rendered}</pre>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
