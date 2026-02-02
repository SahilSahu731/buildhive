
"use client"

import { Zap, Shield, Cpu, Users, Rocket, CheckCircle2 } from "lucide-react"

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything required to ship high-quality code</h2>
                    <p className="mt-4 text-lg text-muted-foreground">buildershub is more than just a review tool. It's a complete ecosystem.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Users className="w-6 h-6 text-primary" />}
                        title="Team Matching"
                        description="Find collaborators based on skills and shared interests."
                    />
                    <FeatureCard 
                        icon={<Rocket className="w-6 h-6 text-primary" />}
                        title="Project Launchpad"
                        description="Templates and tools to go from idea to MVP fast."
                    />
                    <FeatureCard 
                        icon={<Zap className="w-6 h-6 text-primary" />}
                        title="AI Companion"
                        description="Instant feedback on bugs, code style, and complexity."
                    />
                    <FeatureCard 
                        icon={<CheckCircle2 className="w-6 h-6 text-primary" />}
                        title="Verified Portfolio"
                        description="Showcase your best work with trusted verification."
                    />
                    <FeatureCard 
                        icon={<Shield className="w-6 h-6 text-primary" />}
                        title="Security Scanning"
                        description="Automatically detect vulnerabilities like XSS and SQLi."
                    />
                    <FeatureCard 
                        icon={<Cpu className="w-6 h-6 text-primary" />}
                        title="Performance Tips"
                        description="Identify bottlenecks and optimization opportunities."
                    />
                </div>
            </div>
        </section>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="group p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    )
}
