"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { verifyOtp, sendOtp } from "@/lib/api"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const type = searchParams.get("type") as "login" | "signup" | null
  const name = searchParams.get("name") // Only for signup

  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  })

  // Redirect if params missing
  React.useEffect(() => {
    if (!email || !type) {
      toast.error("Invalid verification link");
      router.push("/login");
    }
  }, [email, type, router]);

  async function onOtpSubmit(data: z.infer<typeof otpSchema>) {
    if (!email || !type) return;

    setIsLoading(true)
    try {
      const res = await verifyOtp(email, data.otp, type, name || undefined);
      
      // Store token
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
       
      toast.success(type === "signup" ? "Account created successfully!" : "Successfully logged in!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function onResendOtp() {
    if (!email || !type) return;
    setIsLoading(true);
    try {
      await sendOtp(email, type);
      toast.success("New code sent!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!email || !type) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Verify it's you</h1>
        <p className="text-muted-foreground">
          Enter the code sent to {email}
        </p>
      </div>

      <div className="space-y-4">
        <form onSubmit={form.handleSubmit(onOtpSubmit)} className="space-y-4">
          <div className="flex justify-center py-4">
            <Controller
              control={form.control}
              name="otp"
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  {...field}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </div>
           {form.formState.errors.otp && (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.otp.message}
              </p>
            )}
          <Button className="w-full py-6" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>
           <Button 
              variant="ghost" 
              className="w-full py-6" 
              onClick={onResendOtp}
              type="button"
              disabled={isLoading}
           >
              Resend Code
           </Button>
        </form>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </React.Suspense>
  )
}
