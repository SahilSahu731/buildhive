
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork, Users } from "lucide-react"
import Link from "next/link"

export function CommunitySection() {
    const projects = [
        {
            title: "TaskFlow AI",
            description: "An intelligent project management tool that auto-prioritizes tasks using machine learning.",
            tags: ["React", "Python", "TensorFlow"],
            stars: 124,
            forks: 35,
            contributors: 8,
            color: "bg-blue-500"
        },
        {
            title: "CryptoWatch",
            description: "Real-time cryptocurrency dashboard with sentiment analysis from social media feeds.",
            tags: ["Next.js", "Node.js", "Socket.io"],
            stars: 89,
            forks: 12,
            contributors: 4,
            color: "bg-purple-500"
        },
        {
            title: "EcoTrack",
            description: "Mobile-first application to track personal carbon footprint and suggest lifestyle changes.",
            tags: ["React Native", "Firebase", "Expo"],
            stars: 256,
            forks: 42,
            contributors: 15,
            color: "bg-green-500"
        }
    ]

    return (
        <section className="py-24 bg-muted/20 border-t">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Built on buildershub</h2>
                        <p className="text-lg text-muted-foreground">
                            Explore thousands of innovative projects launched by our community. 
                            Find a project that interests you and join the squad.
                        </p>
                    </div>
                    <Link href="/projects">
                        <Button variant="outline" className="hidden md:flex">View All Projects</Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {projects.map((project, i) => (
                        <div key={i} className="group flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-lg ${project.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                        {project.title[0]}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        <span>{project.stars}</span>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                                    {project.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="px-2 py-0 text-[10px] font-normal">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {project.contributors}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <GitFork className="w-4 h-4" />
                                        {project.forks}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">View Details</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 text-center md:hidden">
                     <Link href="/projects">
                        <Button variant="outline" className="w-full">View All Projects</Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
