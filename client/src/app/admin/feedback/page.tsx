
"use client"

import { useEffect, useState } from "react"
import { getAllFeedbacks, updateFeedbackStatus, deleteFeedback } from "@/lib/api"
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
import { Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeedbacks = async () => {
    try {
        const data = await getAllFeedbacks(1, 100)
        setFeedbacks(data.feedbacks)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this feedback?")) return
      try {
          await deleteFeedback(id)
          toast.success("Feedback deleted")
          loadFeedbacks()
      } catch (error) {
          toast.error("Failed to delete feedback")
      }
  }

  const handleStatusChange = async (id: string, status: string) => {
      try {
          await updateFeedbackStatus(id, status)
          toast.success("Status updated")
          // Optimistic update
          setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status } : f))
      } catch (error) {
          toast.error("Failed to update status")
      }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'OPEN': return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Open</Badge>
        case 'IN_PROGRESS': return <Badge variant="secondary">In Progress</Badge>
        case 'RESOLVED': return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>
        case 'CLOSED': return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Closed</Badge>
        default: return <Badge>{status}</Badge>
    }
  }

  if (loading) return <div>Loading feedback...</div>

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Feedback & Issues</h2>
            <Button onClick={loadFeedbacks} variant="outline" size="sm">Refresh</Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="w-[400px]">Content</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                      <Badge variant={item.type === 'BUG' ? 'destructive' : 'outline'}>
                          {item.type}
                      </Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-col gap-1">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-col">
                          <span className="text-sm">{item.user?.name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">{item.user?.email}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                      <Select defaultValue={item.status} onValueChange={(val) => handleStatusChange(item.id, val)}>
                          <SelectTrigger className="w-[130px] h-8">
                             {getStatusBadge(item.status)}
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="OPEN">Open</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="RESOLVED">Resolved</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                      </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
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
