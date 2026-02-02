
"use client"

import { useEffect, useState } from "react"
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/api"
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
import { Trash2, Megaphone, Plus, Power } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  // Create Form State
  const [newMessage, setNewMessage] = useState("")
  const [newType, setNewType] = useState("BANNER")
  const [newActive, setNewActive] = useState(true)

  const loadAnnouncements = async () => {
    try {
        const data = await getAllAnnouncements()
        setAnnouncements(data)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          await createAnnouncement({ message: newMessage, type: newType, isActive: newActive })
          toast.success("Announcement created")
          setNewMessage("")
          setIsCreateOpen(false)
          loadAnnouncements()
      } catch (error) {
          toast.error("Failed to create announcement")
      }
  }

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this announcement?")) return
      try {
          await deleteAnnouncement(id)
          toast.success("Announcement deleted")
          loadAnnouncements()
      } catch (error) {
          toast.error("Failed to delete announcement")
      }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean, message: string, type: string) => {
      try {
          await updateAnnouncement(id, { isActive: !currentStatus, message, type })
          toast.success("Status updated")
          loadAnnouncements()
      } catch (error) {
          toast.error("Failed to update status")
      }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
            
             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newType} onValueChange={setNewType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BANNER">Top Banner</SelectItem>
                            <SelectItem value="POPUP">Popup Dialog</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                        id="message" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        required 
                        placeholder="e.g. This site is under development..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                      <Label htmlFor="active">Active</Label>
                      <Switch id="active" checked={newActive} onCheckedChange={setNewActive} />
                  </div>
                  <DialogFooter>
                      <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Active</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[400px]">Message</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                      <Switch 
                          checked={item.isActive} 
                          onCheckedChange={() => handleToggleActive(item.id, item.isActive, item.message, item.type)}
                      />
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                      <div className="font-medium whitespace-pre-wrap">{item.message}</div>
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
