
"use client"

import { CheckCircle2, ArrowRight } from "lucide-react"

export function HowItWorksSection() {
    const steps = [
        {
            title: "Connect",
            description: "Find your perfect co-founder or join an existing high-impact team.",
            icon: "1"
        },
        {
            title: "Build",
            description: "Write better code with our real-time collaboration tools and AI assistant.",
            icon: "2"
        },
        {
            title: "Ship",
            description: "Deploy your project and automatically update your verified portfolio.",
            icon: "3"
        }
    ]

    return (
        <section className="py-24 bg-background border-y">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative">
                        {/* Visual representation of process */}
                        <div className="relative rounded-2xl bg-muted/30 border p-8 space-y-8">
                             {steps.map((step, index) => (
                                 <div key={index} className="flex items-start gap-4 relative z-10">
                                     <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 shadow-lg">
                                         {step.icon}
                                     </div>
                                     <div className="pt-1">
                                         <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                         <p className="text-muted-foreground text-sm">{step.description}</p>
                                     </div>
                                 </div>
                             ))}
                             {/* Connector Line */}
                             <div className="absolute top-12 bottom-12 left-[43px] w-0.5 bg-primary/20 z-0" />
                        </div>
                    </div>
                    
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Accelerate Your Journey</h2>
                        <p className="text-lg text-muted-foreground mb-8 text-pretty">
                            Building side-projects shouldn't be lonely or chaotic. BuildHive provides the structure, network, and tools you need to succeed.
                        </p>
                        <div className="space-y-4 mb-8">
                            {[
                                "Smart Team Matching",
                                "AI-Powered Development",
                                "Project Management Tools",
                                "Portfolio Verification"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
