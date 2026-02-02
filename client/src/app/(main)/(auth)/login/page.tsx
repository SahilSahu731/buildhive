"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { toast } from "sonner"
import { sendOtp, verifyOtp } from "@/lib/api"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export default function LoginPage() {
  const router = useRouter()
  const { isLoading: isAuthCheckLoading } = useAuthRedirect() // Add this
  const [isLoading, setIsLoading] = React.useState(false)

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  })

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    try {
      await sendOtp(data.email, "login");
      toast.success("Login code sent!");
      router.push(`/verify?email=${encodeURIComponent(data.email)}&type=login`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthCheckLoading) {
    return (
      <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your email to sign in or create an account
        </p>
      </div>

      <div className="space-y-4">
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              className="py-6"
              autoCorrect="off"
              disabled={isLoading}
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button className="w-full py-6" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Email
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            type="button" 
            className="py-6" 
            disabled={isLoading}
            onClick={() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              window.location.href = `${apiUrl}/auth/google`;
            }}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            className="py-6" 
            disabled={isLoading}
            onClick={() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              window.location.href = `${apiUrl}/auth/github`;
            }}
          >
            <FaGithub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
