
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, FolderOpen, LogOut, ShieldAlert, MessageSquare, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMyProfile } from "@/lib/api"
import { toast } from "sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getMyProfile()
        if (user.role !== 'admin') {
           toast.error("Access Denied", {
               description: "You do not have permission to view this page."
           })
           router.push('/dashboard')
        } else {
            setIsAdmin(true)
        }
      } catch (error) {
         router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Admin Panel...</div>
  if (!isAdmin) return null

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/projects", label: "Projects", icon: FolderOpen },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  ]

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl">
             <ShieldAlert className="w-6 h-6 text-destructive" />
             <span>Admin Panel</span>
           </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
           {navItems.map((item) => {
             const Icon = item.icon
             const isActive = pathname === item.href
             return (
               <Link key={item.href} href={item.href}>
                 <Button 
                   variant={isActive ? "secondary" : "ghost"} 
                   className={`w-full justify-start ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                 >
                   <Icon className="w-4 h-4 mr-2" />
                   {item.label}
                 </Button>
               </Link>
             )
           })}
        </nav>

        <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={() => router.push('/dashboard')}>
                <LogOut className="w-4 h-4 mr-2" />
                Exit to App
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
         <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
             <h1 className="font-semibold text-lg">{navItems.find(i => i.href === pathname)?.label || 'Dashboard'}</h1>
             <div className="md:hidden">
                 {/* Mobile menu trigger could go here */}
                 Menu
             </div>
         </header>
         <div className="p-6">
             {children}
         </div>
      </main>
    </div>
  )
}
