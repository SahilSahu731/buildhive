
"use client"

import { useEffect, useState } from "react"
import { getMyProfile, getMyProjects, getSubscriptionStatus } from "@/lib/api"
import { codeReviewAPI } from "@/lib/codeReviewApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Code2, FolderGit2, Activity } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
        try {
            const [userData, projectsData, reviewsData, subData] = await Promise.all([
                getMyProfile(),
                getMyProjects(),
                codeReviewAPI.getMyReviews(1, 3),
                getSubscriptionStatus()
            ]);
            setUser(userData);
            setProjects(projectsData || []);
            setReviews(reviewsData.reviews || []);
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
    <div className="container mx-auto max-w-6xl py-8 space-y-8 mt-16 px-4 sm:px-6 lg:px-8">
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
                    <CardTitle className="text-sm font-medium">Daily Reviews</CardTitle>
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{subscription?.usage || 0} / {subscription?.limit || 5}</div>
                    <Progress value={subscription?.percentUsed || 0} className="h-1 mt-2" />
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
            {/* Recent Code Reviews */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Code Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No reviews yet.</p>
                        ) : (
                            reviews.map((review: any) => (
                                <div key={review.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                    <div>
                                        <p className="font-medium text-sm">{review.language}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-sm font-bold ${
                                            review.score >= 80 ? "text-green-500" :
                                            review.score >= 50 ? "text-yellow-500" : "text-red-500"
                                        }`}>
                                            {review.score}/100
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
