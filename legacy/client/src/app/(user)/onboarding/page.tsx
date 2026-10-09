"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { completeOnboardingAPI, getMyProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const QUICK_SKILLS = [
  "Frontend",
  "Backend",
  "Design",
  "No-code",
  "AI",
  "Marketing",
  "Content",
  "Product",
];

const GOAL_TEMPLATES = [
  "Launch my first project",
  "Get clients and grow income",
  "Build in public consistently",
  "Improve my portfolio and skills",
  "Learn with a clear weekly plan",
  "I am exploring what fits me",
];

type SkillLevel = (typeof LEVELS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [skillLevel, setSkillLevel] = React.useState<SkillLevel | "">("");
  const [goal, setGoal] = React.useState("");
  const [preferredStack, setPreferredStack] = React.useState("");
  const [skills, setSkills] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);

  const parsedSkills = React.useMemo(() => {
    return skills
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [skills]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const profile = await getMyProfile();
        if (profile?.onboardingCompleted) {
          router.replace("/dashboard");
          return;
        }

        if (profile?.skillLevel) setSkillLevel(profile.skillLevel);
        if (profile?.goal) setGoal(profile.goal);
        if (profile?.preferredStack) setPreferredStack(profile.preferredStack);
        if (profile?.skills?.length) setSkills(profile.skills.join(", "));
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillLevel) {
      toast.error("Please select your skill level.");
      return;
    }

    if (!goal.trim()) {
      toast.error("Please add your primary goal.");
      return;
    }

    setSaving(true);

    try {
      await completeOnboardingAPI({
        skillLevel,
        goal: goal.trim(),
        preferredStack: preferredStack.trim() || undefined,
        skills: parsedSkills,
      });

      toast.success("Onboarding completed. Welcome to vibeship.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setSaving(false);
    }
  };

  const toggleQuickSkill = (value: string) => {
    const existing = new Set(parsedSkills.map((item) => item.toLowerCase()));
    const isSelected = existing.has(value.toLowerCase());

    const next = isSelected
      ? parsedSkills.filter((item) => item.toLowerCase() !== value.toLowerCase())
      : [...parsedSkills, value];

    setSkills(next.join(", "));
  };

  const pickGoalTemplate = (template: string) => {
    setSelectedTemplate(template);
    if (!goal.trim()) {
      setGoal(template);
    }
  };

  const quickStart = async () => {
    setSaving(true);
    try {
      await completeOnboardingAPI({
        skillLevel: skillLevel || "BEGINNER",
        goal: goal.trim() || "I want to explore and find the best workflow for me.",
        preferredStack: preferredStack.trim() || undefined,
        skills: parsedSkills,
      });
      toast.success("You are all set. Welcome to vibeship.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-0 py-2">
      <Card className="border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Personalize your workspace in under 2 minutes</span>
          </div>
          <CardTitle className="text-2xl">Let us set up vibeship for you</CardTitle>
          <CardDescription>
            This platform is built for everyone, from beginners to experienced builders.
            Share your current level and focus so we can adapt recommendations to your path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label htmlFor="skillLevel">Where are you right now?</Label>
              <Select value={skillLevel} onValueChange={(value) => setSkillLevel(value as SkillLevel)}>
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder="Choose the level that fits best" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner - I am getting started</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate - I ship regularly</SelectItem>
                  <SelectItem value="ADVANCED">Advanced - I optimize and scale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Pick a starting goal</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GOAL_TEMPLATES.map((template) => {
                  const isActive = selectedTemplate === template;
                  return (
                    <button
                      key={template}
                      type="button"
                      onClick={() => pickGoalTemplate(template)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {template}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Your primary goal</Label>
              <Textarea
                id="goal"
                placeholder="Example: Build useful projects, improve my confidence, and publish weekly."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[110px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredStack">Preferred tools or stack (optional)</Label>
              <Input
                id="preferredStack"
                placeholder="Example: React, Figma, Notion, Zapier, Python"
                value={preferredStack}
                onChange={(e) => setPreferredStack(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="skills">Skills and interests</Label>
              <Input
                id="skills"
                placeholder="Comma separated, e.g. Writing, API design, UI, SEO"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {QUICK_SKILLS.map((item) => {
                  const selected = parsedSkills.some((skill) => skill.toLowerCase() === item.toLowerCase());
                  return (
                    <button key={item} type="button" onClick={() => toggleQuickSkill(item)}>
                      <Badge variant={selected ? "default" : "secondary"} className="cursor-pointer">
                        {item}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Onboarding
              </Button>
              <Button type="button" variant="outline" onClick={quickStart} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start With Smart Defaults
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
