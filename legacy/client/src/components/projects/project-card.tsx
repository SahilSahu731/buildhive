"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarDays, GitFork, Star } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  lookingFor: string
  createdAt: string
  images: string[]
  category: string
  difficulty: string
  user: {
    id: string
    name: string | null
    image: string | null
    githubUsername: string | null
  }
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Use first image or fallback pattern
  const hasImage = project.images && project.images.length > 0;
  
  return (
    <Link href={`/projects/${project.id}`} className="block h-full group cursor-pointer w-full">
        <Card className="flex flex-col h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 border-border/50 bg-card overflow-hidden w-full">
        {/* Image Banner */}
        <div className="w-full aspect-video bg-muted relative overflow-hidden">
            {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                src={project.images[0]} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground/30 text-4xl font-bold opacity-20">
                        {project.category?.[0] || "P"}
                    </span>
                </div>
            )}
            <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs font-normal">
                    {project.category || "Project"}
                </Badge>
            </div>
        </div>

        <CardHeader className="space-y-3 pb-3">
            <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 leading-tight text-lg font-bold group-hover:text-primary transition-colors">
                    {project.title}
            </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                <AvatarImage src={project.user.image || ""} />
                <AvatarFallback className="text-[10px]">{project.user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">{project.user.name || "Anonymous"}</p>
            </div>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-4 py-2">
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {project.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="outline" className="text-[10px] px-2 py-0 h-5 border-primary/20 bg-primary/5">
                {tech}
                </Badge>
            ))}
            {project.techStack.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                +{project.techStack.length - 3}
                </span>
            )}
            </div>
        </CardContent>
        
        <CardFooter className="border-t pt-3 pb-3 flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex gap-3">
                <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span className="capitalize flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {project.difficulty || "Intermediate"}
                </span>
            </div>
        </CardFooter>
        </Card>
    </Link>
  )
}
