"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { fetchProjectById } from "@/lib/api"
import { ProjectForm } from "@/components/projects/project-form"
import { Loader2 } from "lucide-react"

export default function EditProjectPage() {
  const { id } = useParams() as { id: string }
  const [project, setProject] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await fetchProjectById(id)
        setProject(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProject()
  }, [id])

  if (isLoading) {
    return (
        <div className="container py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!project) return <div>Project not found</div>

  return (
    <div className="container max-w-3xl py-10">
      <div className="space-y-0.5 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Edit Project</h2>
        <p className="text-muted-foreground">
          Update your project details and status.
        </p>
      </div>
      <ProjectForm initialData={project} mode="edit" />
    </div>
  )
}
