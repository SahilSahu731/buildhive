"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "cmdk"

// Fallback style for Command if not using full shadcn component
const CommandWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
        {children}
    </div>
)

const frameworks = [
  { value: "react", label: "React" },
  { value: "next.js", label: "Next.js" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "node.js", label: "Node.js" },
  { value: "express", label: "Express" },
  { value: "nestjs", label: "NestJS" },
  { value: "python", label: "Python" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "fastapi", label: "FastAPI" },
  { value: "java", label: "Java" },
  { value: "spring", label: "Spring" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "aws", label: "AWS" },
  { value: "firebase", label: "Firebase" },
  { value: "supabase", label: "Supabase" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "graphql", label: "GraphQL" },
  { value: "tailwindcss", label: "TailwindCSS" },
]

interface TechStackSelectProps {
    selected: string[]
    onChange: (value: string[]) => void
}

export function TechStackSelect({ selected = [], onChange }: TechStackSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (framework: string) => {
    onChange(selected.filter((s) => s !== framework))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[40px] h-auto"
        >
            <div className="flex flex-wrap gap-1">
                {selected.length > 0 ? (
                    selected.map((val) => (
                        <Badge key={val} variant="secondary" className="mr-1 mb-1" onClick={(e) => { e.stopPropagation(); handleUnselect(val); }}>
                            {frameworks.find((f) => f.value === val)?.label || val}
                            <X className="ml-1 h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                        </Badge>
                    ))
                ) : (
                    <span className="text-muted-foreground">Select frameworks...</span>
                )}
            </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <CommandWrapper>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <input 
                 className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                 placeholder="Search framework..."
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
             {frameworks
                .filter((f) => f.label.toLowerCase().includes(inputValue.toLowerCase()))
                .map((framework) => (
                <div
                    key={framework.value}
                    className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        selected.includes(framework.value) ? "bg-accent text-accent-foreground" : ""
                    )}
                    onClick={() => {
                        onChange(
                            selected.includes(framework.value)
                            ? selected.filter((s) => s !== framework.value)
                            : [...selected, framework.value]
                        )
                        setOpen(true)
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(framework.value) ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {framework.label}
                </div>
             ))}
             {frameworks.filter((f) => f.label.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && (
                 <div className="py-6 text-center text-sm">No framework found.</div>
             )}
          </div>
        </CommandWrapper>
      </PopoverContent>
    </Popover>
  )
}
