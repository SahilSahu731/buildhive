
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getMyProfile } from "@/lib/api"

export function useAuthRedirect() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await getMyProfile()
        if (profile?.onboardingCompleted) {
          router.replace("/dashboard")
        } else {
          router.replace("/onboarding")
        }
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])
  
  return { isLoading }
}
