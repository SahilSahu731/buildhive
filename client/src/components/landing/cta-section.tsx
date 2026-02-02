
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CtaSection() {
    return (
        <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
             
             <div className="container mx-auto px-4 text-center relative z-10">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to upgrade your code quality?</h2>
                 <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                     Join thousands of developers using buildershub to write better code, faster. Get started with our free tier today.
                 </p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <Link href="/signup">
                         <Button size="lg" variant="secondary" className="h-16 px-12 text-lg rounded-full font-bold shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300">
                             Get Started for Free
                         </Button>
                     </Link>
                     <Link href="/pricing">
                        <Button size="lg" variant="outline" className="h-16 px-12 text-lg rounded-full bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                            View Pricing
                        </Button>
                     </Link>
                 </div>
                 <p className="mt-8 text-sm text-primary-foreground/60">
                     No credit card required · Free 14-day Pro trial · Cancel anytime
                 </p>
             </div>
        </section>
    )
}
