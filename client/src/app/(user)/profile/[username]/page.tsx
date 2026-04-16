"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { getUserProfile } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Fix: Add CardDescription
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCard } from "@/components/projects/project-card"
import { Github, Calendar, MapPin, Link as LinkIcon, Edit, User } from "lucide-react" // Fix: Add User icon
import Link from "next/link"
import { toast } from "sonner"

export default function ProfilePage() {
  const { username } = useParams() as { username: string }
  const [profile, setProfile] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isOwnProfile, setIsOwnProfile] = React.useState(false)

  React.useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const data = await getUserProfile(username)
        if (!data) {
           toast.error("User not found")
           return
        }
        setProfile(data)
        
        // Simple ownership check via local storage token (naive but works for now)
        const token = localStorage.getItem('token');
        if (token) {
             const payload = JSON.parse(atob(token.split('.')[1]));
             if (payload.userId === data.id) setIsOwnProfile(true);
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    if (username) loadProfile()
  }, [username])

  if (isLoading) {
    return (
       <div className="container min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
       </div>
    )
  }

  if (!profile) return (
      <div className="container mt-20 py-20 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">The user you are looking for does not exist.</p>
          <Button asChild className="mt-6" variant="outline">
              <Link href="/">Go Home</Link>
          </Button>
      </div>
  )

  return (
    <div className="container py-10 mt-20 max-w-7xl mx-auto px-4 sm:px-6">
       
       {/* Profile Header */}
       <div className="flex flex-col md:flex-row gap-8 mb-12">
            {/* ... (keep as is) ... */}
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start gap-4">
                <div className="relative group">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                        <AvatarImage src={profile.image || ""} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-muted">{profile.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 border-2 border-background cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                            <Edit className="h-4 w-4" />
                        </div>
                    )}
                </div>
            </div>

            {/* User Info Section */}
            <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                        <p className="text-lg text-muted-foreground font-medium">@{profile.githubUsername || "developer"}</p>
                    </div>
                    {isOwnProfile ? (
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href="/settings/profile">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                    ) : (
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <User className="h-4 w-4" />
                            Follow
                        </Button>
                    )}
                </div>

                {profile.bio && (
                    <p className="max-w-2xl text-muted-foreground leading-relaxed">
                        {profile.bio}
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </div>
                    {profile.githubUrl && (
                        <Link href={profile.githubUrl} target="_blank" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Github className="h-4 w-4" />
                            GitHub Profile
                        </Link>
                    )}
                </div>

                 {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        {profile.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1 font-normal bg-primary/5 hover:bg-primary/10 border-primary/10 transition-colors">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
       </div>

       {/* Stats Grid (Optional for Phase 5, but good for structure) */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Card>
                <CardHeader className="p-4 pb-2">
                    <CardDescription>Projects</CardDescription>
                    <CardTitle className="text-2xl">{profile.projects?.length || 0}</CardTitle>
                </CardHeader>
            </Card>
             <Card>
                <CardHeader className="p-4 pb-2">
                    <CardDescription>Reputation</CardDescription>
                    <CardTitle className="text-2xl">120</CardTitle>
                </CardHeader>
            </Card>
             <Card>
                <CardHeader className="p-4 pb-2">
                    <CardDescription>Contributions</CardDescription>
                    <CardTitle className="text-2xl">0</CardTitle>
                </CardHeader>
            </Card>
             <Card>
                <CardHeader className="p-4 pb-2">
                    <CardDescription>Followers</CardDescription>
                    <CardTitle className="text-2xl">0</CardTitle>
                </CardHeader>
            </Card>
       </div>

       {/* Main Content Tabs */}
       <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Created Projects</h2>
                </div>
                
                {profile.projects && profile.projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profile.projects.map((project: any) => (
                            <ProjectCard key={project.id} project={{...project, user: { name: profile.name, image: profile.image, id: profile.id, githubUsername: profile.githubUsername } }} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-20 rounded-xl border border-dashed bg-card/50">
                        <div className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4">
                            <Layers className="h-full w-full" /> {/* Fix: Use valid lucide icon or import Layers */ }
                        </div>
                        <h3 className="text-lg font-medium">No projects yet</h3>
                        <p className="text-muted-foreground mt-1">This user hasn't published any projects.</p>
                     </div>
                )}
            </TabsContent>

            <TabsContent value="contributions">
                <div className="text-center py-20 rounded-xl border border-dashed bg-card/50">
                    <h3 className="text-lg font-medium">Coming Soon</h3>
                    <p className="text-muted-foreground mt-1">Contribution history will be available Soon.</p>
                </div>
            </TabsContent>
       </Tabs>

    </div>
  )
}

function Layers(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}
