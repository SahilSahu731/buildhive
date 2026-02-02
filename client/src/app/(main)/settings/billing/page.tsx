
"use client"

import { useEffect, useState } from "react"
import { getSubscriptionStatus } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PricingModal } from "@/components/subscription/pricing-modal"
import { Loader2, CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
        try {
            const data = await getSubscriptionStatus();
            setSubscription(data);
        } catch (error) {
            console.error("Failed to fetch subscription", error);
        } finally {
            setLoading(false);
        }
    }
    fetchStatus();
  }, [showPricing]);

  if (loading) {
      return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!subscription) {
      return <div className="p-8 text-center">Failed to load subscription details.</div>
  }

  const isFree = subscription.plan === 'FREE';

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8 mt-16 px-4 sm:px-6 lg:px-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your plan and usage limits.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Current Plan
                        <Badge variant={isFree ? "secondary" : "default"}>{subscription.plan}</Badge>
                    </CardTitle>
                    <CardDescription>
                        {isFree 
                            ? "You are currently on the Free tier." 
                            : `Your ${subscription.plan} subscription is active.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        {isFree ? (
                             <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                             <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span>
                            {isFree ? "Limited features access" : "Full features access"}
                        </span>
                    </div>
                    {!isFree && subscription.endDate && (
                        <div className="text-sm text-muted-foreground">
                            Renews on {new Date(subscription.endDate).toLocaleDateString()}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setShowPricing(true)} variant={isFree ? "default" : "outline"}>
                        {isFree ? "Upgrade Plan" : "Change Plan"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Usage Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Limits</CardTitle>
                    <CardDescription>Your daily code review usage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Code Reviews</span>
                            <span className="text-muted-foreground">{subscription.usage} / {subscription.limit}</span>
                        </div>
                        <Progress value={subscription.percentUsed} className="h-2" />
                        <p className="text-xs text-muted-foreground pt-1">Resets in {Math.ceil((new Date(subscription.resetTime).getTime() - Date.now()) / (1000 * 60 * 60))} hours</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Helper to open modal */}
        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
