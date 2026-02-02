
"use client"

import { useEffect, useState } from "react"
import { getAllProjectsAsAdmin, deleteProjectAsAdmin } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

import { format } from "date-fns"
import { toast } from "sonner"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = async () => {
    try {
        const data = await getAllProjectsAsAdmin(1, 100)
        setProjects(data.projects)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this project?")) return
      try {
          await deleteProjectAsAdmin(id)
          toast.success("Project deleted")
          loadProjects()
      } catch (error) {
          toast.error("Failed to delete project")
      }
  }

  if (loading) return <div>Loading projects...</div>

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <Button onClick={loadProjects} variant="outline" size="sm">Refresh</Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{project.description}</div>
                  </TableCell>
                  <TableCell>
                      <div className="text-sm">{project.user?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{project.user?.email}</div>
                  </TableCell>
                  <TableCell>
                      <Badge variant="secondary">{project.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  )
}
