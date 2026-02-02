
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Bug, Lightbulb, Loader2, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { submitFeedback } from "@/lib/api"
import { toast } from "sonner"

export function FeedbackModal() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("FEEDBACK")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
      const handleOpen = () => setOpen(true)
      window.addEventListener('open-feedback', handleOpen)
      return () => window.removeEventListener('open-feedback', handleOpen)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await submitFeedback({ type, title, description, rating })
      toast.success("Thank you for your feedback!")
      setOpen(false)
      setTitle("")
      setDescription("")
      setRating(0)
      setType("FEEDBACK")
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share your thoughts</DialogTitle>
          <DialogDescription>
            Help us improve BuildHive. Report a bug, suggest a feature, or just say hi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex justify-center mb-2">
             <div className="flex gap-1">
                 {[1, 2, 3, 4, 5].map((star) => (
                     <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`hover:scale-110 transition-transform ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                     >
                         <Star className={star <= rating ? "fill-yellow-400 w-8 h-8" : "w-8 h-8"} />
                     </button>
                 ))}
             </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Feedback Type</Label>
            <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="FEEDBACK"><div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> General Feedback</div></SelectItem>
                    <SelectItem value="BUG"><div className="flex items-center gap-2"><Bug className="w-4 h-4" /> Report a Bug</div></SelectItem>
                    <SelectItem value="FEATURE_REQUEST"><div className="flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Feature Request</div></SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary..."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more details..."
              required
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
