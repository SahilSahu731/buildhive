
"use client"

import { useEffect, useState } from "react"
import { getPlanComparisonAPI, getSubscriptionStatus, manageSubscriptionAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PricingModal } from "@/components/subscription/pricing-modal"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type PlanData = {
    id: "FREE" | "PREMIUM" | "PRO"
    name: string
    amountInrMonthly: number
    dailyWorkflowActions: number
    features: string[]
}

type SubscriptionStatus = {
    plan: "FREE" | "PREMIUM" | "PRO"
    usage: number
    limit: number
    percentUsed: number
    resetTime: string
    status?: string | null
    endDate?: string | null
    trialEligible?: boolean
    trialDaysLeft?: number
    conversionPrompt?: {
        variant: "NONE" | "TRIAL" | "UPGRADE"
        title: string
        message: string
    }
    canUpgrade?: boolean
    canDowngrade?: boolean
    canCancel?: boolean
    canResume?: boolean
}

export default function BillingPage() {
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
    const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

    const loadData = async () => {
        setLoading(true)
        try {
            const [statusData, plansData] = await Promise.all([
                getSubscriptionStatus(),
                getPlanComparisonAPI(),
            ])
            setSubscription(statusData)
            setPlans(plansData?.plans || [])
        } catch (error) {
            console.error("Failed to fetch billing data", error)
        } finally {
            setLoading(false)
    }
    }

    useEffect(() => {
        loadData()
    }, [showPricing])

    const handleManage = async (
        action: "UPGRADE" | "DOWNGRADE" | "CANCEL" | "RESUME",
        targetPlan?: "FREE" | "PREMIUM" | "PRO"
    ) => {
        setUpdating(true)
        try {
            await manageSubscriptionAPI({ action, targetPlan })
            toast.success("Subscription updated")
            await loadData()
        } catch (error: any) {
            toast.error(error.message || "Failed to update subscription")
        } finally {
            setUpdating(false)
        }
    }

  if (loading) {
      return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!subscription) {
      return <div className="p-8 text-center">Failed to load subscription details.</div>
  }

  const isFree = subscription.plan === 'FREE';

  return (
    <div className="container mx-auto max-w-4xl py-2 space-y-8 px-0">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage limits, compare plans, and handle upgrades or cancellations.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Current Plan
                        <Badge variant={isFree ? "secondary" : "default"}>{subscription.plan}</Badge>
                    </CardTitle>
                    <CardDescription>
                        {isFree 
                            ? "You are currently on the Free tier." 
                            : `Your ${subscription.plan} subscription is ${subscription.status || "active"}.`}
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
                                        {subscription.conversionPrompt && subscription.conversionPrompt.variant !== "NONE" && (
                                            <div className="rounded-md border border-border/80 p-3 text-sm">
                                                <p className="font-medium">{subscription.conversionPrompt.title}</p>
                                                <p className="text-muted-foreground mt-1">{subscription.conversionPrompt.message}</p>
                                            </div>
                                        )}
                </CardContent>
                                <CardFooter className="flex flex-wrap gap-2">
                    <Button onClick={() => setShowPricing(true)} variant={isFree ? "default" : "outline"}>
                        {isFree ? "Upgrade Plan" : "Change Plan"}
                    </Button>
                                        {subscription.plan === "PRO" && (
                                            <Button
                                                variant="outline"
                                                disabled={updating}
                                                onClick={() => handleManage("DOWNGRADE", "PREMIUM")}
                                            >
                                                Downgrade to Premium
                                            </Button>
                                        )}
                                        {subscription.plan !== "FREE" && (
                                            <Button
                                                variant="outline"
                                                disabled={updating}
                                                onClick={() => handleManage("DOWNGRADE", "FREE")}
                                            >
                                                Downgrade to Free
                                            </Button>
                                        )}
                                        {subscription.canCancel && (
                                            <Button
                                                variant="destructive"
                                                disabled={updating}
                                                onClick={() => handleManage("CANCEL")}
                                            >
                                                Cancel Subscription
                                            </Button>
                                        )}
                                        {subscription.canResume && (
                                            <Button
                                                variant="outline"
                                                disabled={updating}
                                                onClick={() => handleManage("RESUME")}
                                            >
                                                Resume Subscription
                                            </Button>
                                        )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                                        <CardTitle>Free Tier Limits and Usage</CardTitle>
                                        <CardDescription>Daily workflow actions reset every midnight.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Workflow Actions</span>
                            <span className="text-muted-foreground">{subscription.usage} / {subscription.limit}</span>
                        </div>
                        <Progress value={subscription.percentUsed} className="h-2" />
                        <p className="text-xs text-muted-foreground pt-1">Resets in {Math.ceil((new Date(subscription.resetTime).getTime() - Date.now()) / (1000 * 60 * 60))} hours</p>
                    </div>
                                        <div className="rounded-md border border-border/80 p-3 text-sm text-muted-foreground">
                                            Free plan: 5 actions/day, Premium: 50/day, Pro: 1000/day.
                                        </div>
                </CardContent>
            </Card>
        </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan Comparison</CardTitle>
                        <CardDescription>Checkout, upgrade/downgrade, and monetization prompts in one place.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {plans.map((plan) => {
                                const isCurrent = subscription.plan === plan.id
                                return (
                                    <div key={plan.id} className="rounded-lg border border-border/80 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{plan.name}</p>
                                            {isCurrent && <Badge>Current</Badge>}
                                        </div>
                                        <p className="text-2xl font-bold">{plan.amountInrMonthly === 0 ? "Free" : `INR ${plan.amountInrMonthly}/mo`}</p>
                                        <p className="text-sm text-muted-foreground">{plan.dailyWorkflowActions} workflow actions/day</p>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            {plan.features.map((feature) => (
                                                <li key={feature}>- {feature}</li>
                                            ))}
                                        </ul>
                                        {!isCurrent && plan.id !== "FREE" && (
                                            <Button className="w-full" variant="outline" onClick={() => setShowPricing(true)}>
                                                Checkout {plan.name}
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
        
        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
