
"use client"

import { useEffect, useState } from "react"
import { getMyProfile, getMyProjects, getSubscriptionStatus } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, FolderGit2, Activity, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
        try {
            const [userData, projectsData, subData] = await Promise.all([
                getMyProfile(),
                getMyProjects(),
                getSubscriptionStatus()
            ]);
            setUser(userData);
            setProjects(projectsData || []);
            setSubscription(subData);
        } catch (e) {
            console.error("Dashboard load error", e);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="container mx-auto max-w-6xl py-2 space-y-8 px-0 sm:px-0 lg:px-0">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            <Link href="/projects/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Stats */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published Projects</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{projects.filter((p) => p.status === "open").length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently open in the community</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Plan</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold uppercase">{subscription?.plan || "FREE"}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Execution Focus</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li>Use one workflow per week to reduce context switching.</li>
                        <li>Track one measurable output goal for each project.</li>
                        <li>Convert repeat prompts into reusable templates.</li>
                        <li>Keep your project descriptions outcome-focused for better collaboration.</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Recent Projects or Activity */}
            <Card className="col-span-3">
                 <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                         {projects.slice(0, 3).map((project: any) => (
                             <div key={project.id} className="flex items-center justify-between">
                                 <div className="truncate">
                                     <p className="font-medium text-sm truncate">{project.title}</p>
                                     <p className="text-xs text-muted-foreground">{project.role} • {project.status}</p>
                                 </div>
                                 <Link href={`/projects/${project.id}`}>
                                    <Button variant="ghost" size="sm">View</Button>
                                 </Link>
                             </div>
                         ))}
                         {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
