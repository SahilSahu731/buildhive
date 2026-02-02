"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash, Link as LinkIcon, Github } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TechStackSelect } from "./tech-stack-select"
import { createProject, updateProject } from "@/lib/api"

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  techStack: z.array(z.string()).min(1, "Select at least one technology"),
  lookingFor: z.string().min(1, "Please select what you are looking for"),
  status: z.enum(["open", "closed", "in-progress"]).optional(),
  images: z.array(z.string().url("Invalid URL")).optional(),
  demoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  difficulty: z.string().optional(),
  category: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialData?: ProjectFormValues & { id?: string }
  mode?: "create" | "edit"
}

export function ProjectForm({ initialData, mode = "create" }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      techStack: [],
      lookingFor: "",
      status: "open",
      images: [],
      demoUrl: "",
      repoUrl: "",
      difficulty: "Intermediate",
      category: "Web Development"
    },
  })

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    }
  }

  // Remove selected file
  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  // Remove existing image
  const removeExistingImage = (index: number) => {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
  }

  // Create/Update with FormData
  async function onSubmit(data: ProjectFormValues) {
    setIsLoading(true)
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('lookingFor', data.lookingFor);
      formData.append('difficulty', data.difficulty || "Intermediate");
      formData.append('category', data.category || "Web Development");
      if (data.status) formData.append('status', data.status);
      if (data.demoUrl) formData.append('demoUrl', data.demoUrl);
      if (data.repoUrl) formData.append('repoUrl', data.repoUrl);

      // Append techStack
      if (data.techStack.length > 0) {
          // Sending as JSON string is often safer with some backend parsers
          formData.append('techStack', JSON.stringify(data.techStack));
      }

      // Append Existing Images (to keep)
      if (existingImages.length > 0) {
          formData.append('images', JSON.stringify(existingImages));
      }

      // Append New Files
      selectedFiles.forEach(file => {
          formData.append('imageFiles', file);
      });

      if (mode === "create") {
         const newProject = await createProject(formData);
         toast.success("Project created successfully!");
         router.push(`/projects/${newProject.id}`);
      } else if (mode === "edit" && initialData?.id) {
         await updateProject(initialData.id, formData);
         toast.success("Project updated successfully!");
         router.push(`/projects/${initialData.id}`);
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. buildershub" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Mobile App">Mobile App</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Game Development">Game Development</SelectItem>
                        <SelectItem value="Blockchain">Blockchain</SelectItem>
                        <SelectItem value="IoT">IoT</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <div className="space-y-8">
                <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                    control={form.control}
                    name="lookingFor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Looking For</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="frontend">Frontend Developers</SelectItem>
                            <SelectItem value="backend">Backend Developers</SelectItem>
                            <SelectItem value="fullstack">Fullstack Developers</SelectItem>
                            <SelectItem value="designer">UI/UX Designers</SelectItem>
                            <SelectItem value="mobile">Mobile Developers</SelectItem>
                            <SelectItem value="mentor">Mentors</SelectItem>
                            <SelectItem value="co-founder">Co-founder</SelectItem>
                            <SelectItem value="any">Anyone interested</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your project, what it does, and what help you need..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="techStack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tech Stack</FormLabel>
              <FormControl>
                <TechStackSelect 
                   selected={field.value} 
                   onChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URLs */}
        <div className="grid md:grid-cols-2 gap-8">
             <FormField
                control={form.control}
                name="demoUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Demo URL (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://..." className="pl-9" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />
             <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Repository URL (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://github.com/..." className="pl-9" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
            <FormLabel>Project Images</FormLabel>
            <div className="border border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors relative">
                <Input 
                   type="file" 
                   id='image-upload'
                   multiple 
                   accept="image/*" 
                   className="absolute inset-0 opacity-0 cursor-pointer" 
                   onChange={handleFileChange}
                />
                <label htmlFor='image-upload'>
                <div  className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                    <Plus className="h-6 w-6" />
                </div>
                </label>
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            </div>
            
            {/* Previews */}
            <div className="flex flex-wrap gap-4 mt-4">
                {/* Existing Images */}
                {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group w-32 h-20 rounded-md overflow-hidden bg-muted border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="project preview" className="object-cover w-full h-full" />
                        <button 
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full p-1 transition-colors"
                        >
                            <Trash className="h-3 w-3" />
                        </button>
                         <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center">Existing</div>
                    </div>
                ))}
                
                {/* New Files */}
                {selectedFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group w-32 h-20 rounded-md overflow-hidden bg-muted border">
                        {/* Preview blob */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="new preview" className="object-cover w-full h-full" />
                        <button 
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full p-1 transition-colors"
                        >
                            <Trash className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 w-full bg-green-500/60 text-white text-[10px] text-center">New</div>
                    </div>
                ))}
            </div>
        </div>

        {/* ... (Status field if edit mode) ... */}
        {mode === "edit" && (
            <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open (Looking for contributors)</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Project" : "Update Project"}
        </Button>
      </form>
    </Form>
  )
}
