"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { 
  Home, 
  Flame, 
  Sparkles, 
  Code2, 
  Laptop, 
  Smartphone, 
  BrainCircuit,
  Globe,
  Plus,
  Rocket
} from "lucide-react"
import Link from "next/link"

// Categories for the sidebar
const categories = [
  { title: "All Projects", url: "/projects", icon: Home },
  { title: "Website", url: "/projects?category=website", icon: Globe },
  { title: "Mobile Apps", url: "/projects?category=mobile", icon: Smartphone },
  { title: "AI & ML", url: "/projects?category=ai", icon: BrainCircuit },
  { title: "Open Source", url: "/projects?category=opensource", icon: Code2 },
]

const recentCommunities = [
  { title: "React Devs", url: "#" },
  { title: "Indie Hackers", url: "#" },
  { title: "UI/UX Design", url: "#" },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r mt-16  border-border/40">
      <SidebarHeader className="border-b border-border/40 px-6 py-4">
         <Link href="/projects/new">
            <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2">
                 <Plus className="h-4 w-4" />
                 <span>New Project</span>
            </button>
         </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Feeds</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>Trending</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/projects?sort=popular">
                                <Flame className="text-orange-500" />
                                <span>Popular</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/projects?sort=new">
                                <Sparkles className="text-yellow-500" />
                                <span>New & Noteworthy</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/projects?status=launching">
                                <Rocket className="text-blue-500" />
                                <span>Launching Soon</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-4">
         <p className="text-xs text-muted-foreground text-center">
            © 2026 buildershub
         </p>
      </SidebarFooter>
    </Sidebar>
  )
}
