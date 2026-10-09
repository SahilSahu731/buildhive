
"use client"

import { PricingModal } from "@/components/subscription/pricing-modal"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PricingPage() {
    const [showModal, setShowModal] = useState(true);

        const plans = [
            {
                id: "FREE",
                title: "Free",
                price: "INR 0",
                description: "Good for trying workflows and basic prompts.",
                points: ["5 workflow actions/day", "Starter workflow library", "Basic prompt packs"],
            },
            {
                id: "PREMIUM",
                title: "Premium",
                price: "INR 99/mo",
                description: "Built for individual builders shipping weekly.",
                points: ["50 workflow actions/day", "Full workflow library", "Advanced prompt packs"],
                popular: true,
            },
            {
                id: "PRO",
                title: "Pro",
                price: "INR 299/mo",
                description: "For teams and heavy execution cycles.",
                points: ["1000 workflow actions/day", "Priority queue", "Priority support"],
            },
        ];
    
    return (
                <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold tracking-tight">Plan Comparison</h1>
                            <p className="text-muted-foreground mt-2">Choose a plan based on your daily execution needs.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {plans.map((plan) => (
                                <Card key={plan.id} className="border-border/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{plan.title}</CardTitle>
                                            {plan.popular && <Badge>Most Popular</Badge>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-2xl font-bold">{plan.price}</p>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            {plan.points.map((point) => <li key={point}>- {point}</li>)}
                                        </ul>
                                        {plan.id === "FREE" ? (
                                            <Button className="w-full" variant="outline" disabled>Current free tier</Button>
                                        ) : (
                                            <Button className="w-full" onClick={() => setShowModal(true)}>
                                                Choose {plan.title}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <Button variant="outline" onClick={() => setShowModal(true)}>Open Checkout</Button>
                        </div>

                        <PricingModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    )
}
