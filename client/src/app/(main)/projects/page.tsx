"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Search, Filter, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/projects/project-card"
import { fetchProjects } from "@/lib/api"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectCardSkeleton } from "@/components/loading/project-card-skeleton"

// Move main logic to a separate component
function ProjectsContent() {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const category = searchParams.get("category")
  const sortBy = searchParams.get("sort")
  
  const [projects, setProjects] = React.useState<any[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)

  // This would ideally be a useQuery or clearer effect
  React.useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      try {
        // Need to pass category/filters to API eventually
        const data = await fetchProjects(page, 9) 
        setProjects(data.projects)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [page, category, sortBy])

  return (
    <div className=" bg-background">
      {/* Feed Header */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-4 mt-16 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search for projects..." 
                    className="pl-9 bg-accent/50 border-none rounded-full h-10 focus-visible:ring-1"
                />
            </div>
         </div>
         <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full h-9">
                        <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                        Sort
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Recommended</DropdownMenuItem>
                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                    <DropdownMenuItem>Most Popular</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="rounded-full h-9">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter
            </Button>
         </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {category && (
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight capitalize">{category} Projects</h2>
                <p className="text-muted-foreground">Browsing {category} projects</p>
            </div>
        )}

        {/* Grid */}
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={i} />
            ))}
            </div>
        ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No projects found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Try adjusting your filters or be the first to create a project in this category!
                </p>
                <Link href="/projects/new" className="mt-6">
                    <Button>Create Project</Button>
                </Link>
            </div>
        )}

        {/* Pagination Logic */}
        {!isLoading && totalPages > 1 && (
             <div className="flex justify-center gap-2 mt-10 pb-10">
                <Link href={`/projects?page=${Math.max(1, page - 1)}${category ? `&category=${category}` : ''}`}>
                   <Button variant="outline" disabled={page <= 1}>Previous</Button>
                </Link>
                <span className="flex items-center px-4 text-sm font-medium">
                    Page {page} of {totalPages}
                </span>
                <Link href={`/projects?page=${Math.min(totalPages, page + 1)}${category ? `&category=${category}` : ''}`}>
                    <Button variant="outline" disabled={page >= totalPages}>Next</Button>
                </Link>
             </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <React.Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
             {[1, 2, 3, 4].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
    }>
       <ProjectsContent />
    </React.Suspense>
  )
}
