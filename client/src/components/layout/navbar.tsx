
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ModeToggle } from "../mode-toggle"
import { UserNav } from "./user-nav"
import { FeedbackModal } from "@/components/feedback-modal"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const pathname = usePathname()
  
  const isAppPage = pathname?.startsWith('/projects') || pathname?.startsWith('/messages') || pathname?.startsWith('/profile');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/verify')

  React.useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
    }

    checkLogin()
    window.addEventListener("storage", checkLogin)
    window.addEventListener("auth-change", checkLogin)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("storage", checkLogin)
      window.removeEventListener("auth-change", checkLogin)
    }
  }, [])

  if (isAuthPage) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
        isAppPage 
            ? "bg-background border-border shadow-sm h-16" 
            : isScrolled ? "bg-background/80 backdrop-blur-md border-border py-2 shadow-sm" : "bg-transparent py-4"
      )}
    >
      <div className={cn("container mx-auto px-4 h-full flex items-center justify-between gap-4", isAppPage && "max-w-full")}>
        
        {/* Left: Logo + App Context */}
        <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
                <Image src="/logo.png" alt="buildershub" fill className="object-contain" />
            </div>
            <span className={cn("font-bold text-xl tracking-tight hidden md:inline-block", isAppPage && "lg:inline-block")}>
                buildershub
            </span>
            </Link>

            {/* If in App Mode, Show Navigation Links here too (desktop) */}
             {!isAppPage && (
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Explore
                    </Link>
                    <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Community
                    </Link>
                </nav>
            )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
            <FeedbackModal />
            {/* <ModeToggle /> */}

            {isLoggedIn ? (
                 <>
                    {/* Desktop Buttons */}
                   <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                      <span className="sr-only">Notifications</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                   </Button>
                   <Link href="/code-review">
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                             Review
                        </Button>
                   </Link>
                   <Link href="/projects/new">
                        <Button size="sm" className="hidden sm:inline-flex rounded-full gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                             Create
                        </Button>
                   </Link>
                   <UserNav />
                 </>
            ) : (
                <div className="flex items-center gap-2">
                   <Link href="/login">
                     <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                       Log in
                     </Button>
                   </Link>
                   <Link href="/signup">
                     <Button size="sm" className="rounded-full px-6 hidden sm:inline-flex">Get Started</Button>
                   </Link>
                 </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 border-l">
                    <div className="flex flex-col h-full bg-background">
                         <div className="p-6 border-b">
                             <div className="flex items-center gap-3">
                                 <div className="relative h-8 w-8">
                                    <Image src="/logo.png" alt="buildershub" fill className="object-contain" />
                                </div>
                                <span className="font-bold text-xl tracking-tight">buildershub</span>
                             </div>
                         </div>
                         
                         <div className="flex-1 overflow-auto py-6 px-6">
                             {/* User Profile Section - At Top */}
                             {isLoggedIn && (
                                 <div className="mb-8 p-4 rounded-xl bg-secondary/50 flex items-center gap-4">
                                     <UserNav />
                                     <div className="flex flex-col">
                                         <span className="text-sm font-medium">My Account</span>
                                         <span className="text-xs text-muted-foreground">Manage settings</span>
                                     </div>
                                 </div>
                             )}

                             {!isAppPage && (
                                <nav className="flex flex-col gap-1 mb-8">
                                    <Link href="/projects" className="flex items-center gap-2 px-2 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors">
                                        Explore Projects
                                    </Link>
                                    <Link href="#features" className="flex items-center gap-2 px-2 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors">
                                        Features
                                    </Link>
                                    <Link href="#how-it-works" className="flex items-center gap-2 px-2 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors">
                                        Community
                                    </Link>
                                </nav>
                             )}
                             
                             <div className="flex flex-col gap-3">
                                 {isLoggedIn ? (
                                     <>
                                        <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</div>
                                        <Link href="/code-review">
                                            <Button variant="outline" className="w-full justify-start gap-3 h-11 font-medium">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                                                 Review Code
                                            </Button>
                                        </Link>
                                        <Link href="/projects/new">
                                            <Button className="w-full justify-start gap-3 h-11 font-medium">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                                 Create Project
                                            </Button>
                                        </Link>
                                     </>
                                 ) : (
                                     <div className="grid gap-3 mt-4">
                                        <Link href="/login">
                                           <Button variant="outline" size="lg" className="w-full">Log in</Button>
                                        </Link>
                                        <Link href="/signup">
                                           <Button size="lg" className="w-full">Get Started</Button>
                                        </Link>
                                     </div>
                                 )}
                             </div>
                         </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  )
}
