"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMyProfile, updateProfileAPI } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(160, "Bio must not be longer than 160 characters.").optional(),
  skills: z.string().optional(), // Comma separated string for input
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false) // For submit state
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [currentImage, setCurrentImage] = React.useState<string | null>(null)
  const [userNameChar, setUserNameChar] = React.useState("U")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      skills: "",
    },
  })

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile()
        form.reset({
          name: data.name || "",
          bio: data.bio || "",
          skills: data.skills ? data.skills.join(", ") : "",
        })
        setCurrentImage(data.image)
        setUserNameChar(data.name?.[0] || "U")
      } catch (error) {
        toast.error("Failed to load profile")
        router.push("/projects") // Fallback
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [form, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file is too large (max 5MB)")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setUpdating(true)
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      if (data.bio) formData.append("bio", data.bio)
      
      // Handle skills (split by comma and trim)
      const skillsArray = data.skills 
          ? data.skills.split(",").map(s => s.trim()).filter(Boolean)
          : []
      
      // JSON stringify the array for backend to parse, or send comma separated string if backend handles it
      // Backend expects string array or string. Our updated logic handles string splitting if passed as string
      formData.append("skills", data.skills || "")

      if (imageFile) {
        formData.append("imageFile", imageFile)
      }

      await updateProfileAPI(formData)
      toast.success("Profile updated successfully")
      
      // Ideally re-fetch or update context, but reload/redirect works for now
      // Let's redirect to profile
      // We need username. We can fetch it or just go back.
      // Fetching MyProfile again to get username is safest if we want to redirect to /profile/:username
      const updatedProfile = await getMyProfile()
      if (updatedProfile.githubUsername) {
           router.push(`/profile/${updatedProfile.githubUsername}`)
      } else {
           router.push("/projects")
      }
      router.refresh() // Refresh server components if any
      
    } catch (error) {
      console.error(error)
      toast.error("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
       <div className="container min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
       </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10 mt-12 mx-auto px-4">
      <div className="mb-8">
         <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information and public profile.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Image Upload Section */}
        <div className="flex flex-col items-center sm:flex-row gap-6 p-6 border rounded-xl bg-card shadow-sm">
             <Avatar className="h-24 w-24 border-2 border-primary/10">
                <AvatarImage src={imagePreview || currentImage || ""} className="object-cover" />
                <AvatarFallback className="text-2xl">{userNameChar}</AvatarFallback>
             </Avatar>
             <div className="space-y-2 flex-1 text-center sm:text-left">
                <h3 className="font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. Max size of 5MB.
                </p>
                <div className="flex gap-2 justify-center sm:justify-start">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload new image
                    </Button>
                    {imagePreview && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                            setImagePreview(null)
                            setImageFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ""
                        }}>
                             <X className="h-4 w-4 mr-2" />
                            Remove
                        </Button>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
             </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can @mention other users and organizations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="React, Node.js, TypeScript, UI/UX" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate your skills with commas.
                  </FormDescription>
                  <FormMessage />
                  
                  {/* Skill Badges Preview */}
                  {field.value && (
                       <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.split(',').map((s, i) => s.trim() ? (
                              <Badge key={i} variant="secondary">{s.trim()}</Badge>
                          ) : null)}
                       </div>
                  )}
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updating}>
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
