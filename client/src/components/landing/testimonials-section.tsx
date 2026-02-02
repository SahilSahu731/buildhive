
"use client"

import { Star } from "lucide-react"

export function TestimonialsSection() {
    return (
        <section className="py-24 border-t bg-background">
             <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold mb-4">Trusted by engineering teams</h2>
                 <p className="text-muted-foreground mb-16 max-w-2xl mx-auto">See why thousands of developers rely on BuildHive for their daily workflow.</p>
                 
                 <div className="grid md:grid-cols-3 gap-8 text-left">
                     {[
                         {
                             quote: "BuildHive's AI reviews catch bugs that even our senior engineers miss. It's become an indispensable part of our CI/CD pipeline.",
                             author: "Sarah Chen",
                             role: "CTO at TechFlow",
                             avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                         },
                         {
                             quote: "The project collaboration tools are cleaner and more intuitive than anything else we've used. It just gets out of the way.",
                             author: "Marcus Johnson",
                             role: "Lead Dev at StartupX",
                             avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
                         },
                         {
                             quote: "I found my co-founder through the Team Matching feature. We're now raising our Series A. Incredible community.",
                             author: "Elena Rodriguez",
                             role: "Founder at CodeNext",
                             avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
                         }
                     ].map((item, i) => (
                         <div key={i} className="bg-muted/30 p-8 rounded-2xl border">
                             <div className="flex gap-1 text-yellow-500 mb-4">
                                 {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                             </div>
                             <p className="text-lg mb-6 leading-relaxed">"{item.quote}"</p>
                             <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                     <img src={item.avatar} alt={item.author} />
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">{item.author}</div>
                                     <div className="text-xs text-muted-foreground">{item.role}</div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>

                 <div className="mt-20 pt-10 border-t grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                      <div className="flex items-center justify-center font-bold text-xl">ACME Corp</div>
                      <div className="flex items-center justify-center font-bold text-xl">DevTools Inc</div>
                      <div className="flex items-center justify-center font-bold text-xl">NextGen AI</div>
                      <div className="flex items-center justify-center font-bold text-xl">CloudScale</div>
                 </div>
             </div>
        </section>
    )
}
