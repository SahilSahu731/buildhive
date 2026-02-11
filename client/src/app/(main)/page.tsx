
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    window.dispatchEvent(new Event("auth-change"))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">buildershub</h1>
        <p className="text-muted-foreground text-lg">
          Authentication is ready. Start building your app.
        </p>
        <div className="flex gap-4 justify-center">
          {isLoggedIn ? (
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        {isLoggedIn && (
          <p className="text-sm text-green-600 dark:text-green-400">✓ You are logged in</p>
        )}
      </div>
    </div>
  )
}
