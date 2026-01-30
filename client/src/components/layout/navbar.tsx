"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ModeToggle } from "../mode-toggle"
import { UserNav } from "./user-nav"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const pathname = usePathname()
  
  const isAppPage = pathname?.startsWith('/projects') || pathname?.startsWith('/messages') || pathname?.startsWith('/profile');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/verify')

  React.useEffect(() => {
    const checkLogin = () => {
      // In a real app we might also check token expiry
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
    }

    checkLogin()
    
    // Listen for storage changes to sync state across tabs or after login
    window.addEventListener("storage", checkLogin)
    
    // Custom event for immediate updates within the same tab
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
        isAppPage 
            ? "bg-background border-border shadow-sm h-16" 
            : isScrolled ? "bg-background/80 backdrop-blur-md border-border py-2 shadow-sm" : "bg-transparent py-4"
      )}
    >
      <div className={cn("container mx-auto px-4 h-full flex items-center justify-between gap-4", isAppPage && "max-w-full")}>
        
        {/* Left: Logo + App Context */}
        <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <div className="h-4 w-4 bg-background rounded-sm rotate-45" />
            </div>
            <span className={cn("font-bold text-xl tracking-tight hidden md:inline-block", isAppPage && "lg:inline-block")}>
                BuildHive
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

        {/* Center: Search Bar (Only visible on App Pages like Reddit) */}
        {/* {isAppPage && (
            <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
                <div className="relative w-full">
                     <div className="flex items-centerh-10 w-full rounded-full border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <span className="text-muted-foreground flex items-center gap-2 w-full">
                            <span className="opacity-50">🔍</span> 
                            <span className="opacity-50 text-xs">Search BuildHive...</span>
                        </span>
                     </div>
                </div>
            </div>
        )}
        */}

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
            {isLoggedIn && (
                 <>
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
                   <Link href="/projects/new">
                        <Button size="sm" className="hidden sm:inline-flex rounded-full gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                             Create
                        </Button>
                   </Link>
                 </>
            )}

           <ModeToggle />
           
           {isLoggedIn ? (
              <UserNav />
           ) : (
             <div className="flex items-center gap-2">
               <Link href="/login">
                 <Button variant="ghost" size="sm" className={cn("hidden sm:inline-flex", !isAppPage && "text-foreground")}>
                   Log in
                 </Button>
               </Link>
               <Link href="/signup">
                 <Button size="sm" className="rounded-full px-6">Get Started</Button>
               </Link>
             </div>
           )}
        </div>
      </div>
    </header>
  )

}
