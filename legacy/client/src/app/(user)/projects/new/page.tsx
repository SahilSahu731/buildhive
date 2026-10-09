"use client"

import { ProjectForm } from "@/components/projects/project-form"
import { Separator } from "@/components/ui/separator"

export default function CreateProjectPage() {
  return (
    <div className="container max-w-3xl py-10 ml-10 mt-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Create Project</h2>
        <p className="text-muted-foreground">
          Share your idea and find the perfect team.
        </p>
      </div>
      <Separator className="my-6" />
      <ProjectForm />
    </div>
  )
}
