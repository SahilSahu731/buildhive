"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPromptPacksAPI } from "@/lib/api";

type PromptPackItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  targetTool: string;
  tags: string[];
  templateCount: number;
};

export default function PromptPacksPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<PromptPackItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [targetTool, setTargetTool] = React.useState("all");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPromptPacksAPI({
        search: search || undefined,
        targetTool: targetTool !== "all" ? targetTool : undefined,
        limit: 24,
      });
      setItems(response.promptPacks || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load prompt packs");
    } finally {
      setLoading(false);
    }
  }, [search, targetTool]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Prompt Packs</h1>
        <p className="text-muted-foreground">
          Reusable prompts with variables, examples, and usage tracking.
        </p>
      </div>

      <Card className="border-border/80">
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompt packs"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={targetTool} onValueChange={setTargetTool}>
              <SelectTrigger>
                <SelectValue placeholder="Target tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tools</SelectItem>
                <SelectItem value="Copilot">Copilot</SelectItem>
                <SelectItem value="Cursor">Cursor</SelectItem>
                <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                <SelectItem value="Claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="outline" onClick={loadData}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No prompt packs found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="border-border/80">
              <CardHeader>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{item.targetTool}</Badge>
                  <Badge variant="outline">{item.templateCount} templates</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link href={`/prompt-packs/${item.slug}`}>
                  <Button className="w-full">Open Pack</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
