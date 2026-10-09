
"use client"

import { useEffect, useState } from "react"
import { getDashboardSummaryAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bell, CalendarCheck2, Compass, Gauge, Sparkles } from "lucide-react"
import Link from "next/link"

type DashboardSummary = {
    personalization: {
        name: string
        skillLevel?: string | null
        goal?: string | null
        preferredStack?: string | null
        plan: "FREE" | "PREMIUM" | "PRO"
    }
    stats: {
        projectsCount: number
        activeRoadmaps: number
        quotaUsage: number
        quotaLimit: number
        quotaPercent: number
    }
    continueCard: {
        workflowId: string
        workflowSlug: string
        workflowTitle: string
        stepId: string
        stepOrder: number
        stepTitle: string
        lastVisitedAt: string
    } | null
    quickActions: Array<{
        id: string
        label: string
        href: string
        description: string
    }>
    weeklyRecap: {
        completedWorkflowSteps: number
        completedRoadmapTasks: number
        weeklyActiveDays: number
        activeRoadmapCompletion?: {
            roadmapId: string
            roadmapTitle: string
            completionRate: number
        } | null
    }
    notifications: Array<{
        id: string
        title: string
        message: string
        eventType: string
        createdAt: string
    }>
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
            try {
                const data = await getDashboardSummaryAPI()
                setSummary(data)
            } catch (e) {
                console.error("Dashboard load error", e)
            } finally {
                setLoading(false)
            }
    }
        loadData()
    }, [])

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

    if (!summary) {
        return <div className="p-8 text-center text-muted-foreground">Failed to load dashboard.</div>
    }

    const { personalization, stats, continueCard, quickActions, weeklyRecap, notifications } = summary

  return (
        <div className="container mx-auto max-w-6xl py-2 space-y-6 px-0">
        <div className="flex items-center justify-between">
            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{personalization.name}&apos;s Dashboard</h1>
                                <p className="text-muted-foreground">Your daily execution cockpit for workflows, roadmaps, and shipping.</p>
            </div>
                        <Badge variant="outline" className="px-3 py-1">Plan: {personalization.plan}</Badge>
        </div>

                <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                                        <Compass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                                        <div className="text-2xl font-bold">{stats.projectsCount}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Roadmaps</CardTitle>
                                        <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                                        <div className="text-2xl font-bold">{stats.activeRoadmaps}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Roadmaps currently in play</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
                                        <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                                        <div className="text-2xl font-bold">{stats.quotaUsage}/{stats.quotaLimit}</div>
                                        <p className="text-xs text-muted-foreground mt-1">{stats.quotaPercent}% of today&apos;s quota used</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                                        <CardTitle>Continue Where You Left Off</CardTitle>
                </CardHeader>
                <CardContent>
                                        {continueCard ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="font-medium">{continueCard.workflowTitle}</p>
                                                    <p className="text-sm text-muted-foreground">Step {continueCard.stepOrder}: {continueCard.stepTitle}</p>
                                                </div>
                                                <Link href={`/workflows/${continueCard.workflowSlug}?resume=${continueCard.stepId}`}>
                                                    <Button>Resume Workflow</Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground">No active workflow progress yet.</p>
                                                <Link href="/workflows"><Button variant="outline">Start a Workflow</Button></Link>
                                            </div>
                                        )}
                </CardContent>
            </Card>

            <Card className="col-span-3">
                 <CardHeader>
                                        <CardTitle>Weekly Recap</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                                            <div className="text-sm text-muted-foreground">Workflow steps completed: <span className="text-foreground font-medium">{weeklyRecap.completedWorkflowSteps}</span></div>
                                            <div className="text-sm text-muted-foreground">Roadmap tasks completed: <span className="text-foreground font-medium">{weeklyRecap.completedRoadmapTasks}</span></div>
                                            <div className="text-sm text-muted-foreground">Active days this week: <span className="text-foreground font-medium">{weeklyRecap.weeklyActiveDays}</span></div>
                                            {weeklyRecap.activeRoadmapCompletion && (
                                                <div className="rounded-md border border-border/80 p-3 text-sm">
                                                    <p className="font-medium">{weeklyRecap.activeRoadmapCompletion.roadmapTitle}</p>
                                                    <p className="text-muted-foreground">Completion: {weeklyRecap.activeRoadmapCompletion.completionRate}%</p>
                                                </div>
                                            )}
                    </div>
                </CardContent>
            </Card>
        </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quickActions.map((action) => (
                                <div key={action.id} className="flex items-center justify-between rounded-md border border-border/80 p-3">
                                    <div>
                                        <p className="font-medium text-sm">{action.label}</p>
                                        <p className="text-xs text-muted-foreground">{action.description}</p>
                                    </div>
                                    <Link href={action.href}><Button size="sm" variant="outline">Open</Button></Link>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />Notifications Center</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications right now.</p>}
                            {notifications.map((notification) => (
                                <div key={notification.id} className="rounded-md border border-border/80 p-3">
                                    <p className="text-sm font-medium">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
    </div>
  )
}
