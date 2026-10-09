"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getMyProfile } from "@/lib/api"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const handleCallback = async () => {
      if (!token) {
        toast.error("Failed to login with GitHub")
        router.push("/login")
        return
      }

      // Store token in localStorage
      localStorage.setItem("token", token)
      
      // Dispatch event for other components to listen (optional)
      window.dispatchEvent(new Event("storage"))

      toast.success("Successfully logged In.")

      try {
        const profile = await getMyProfile()
        if (profile?.onboardingCompleted) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      } catch {
        router.push("/login")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Authenticating...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <CallbackContent />
      </Suspense>
    </div>
  )
}
