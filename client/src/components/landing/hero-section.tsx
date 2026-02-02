
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Terminal, Star, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
            {/* Abstract Background Elements - Very subtble usage of primary color */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Hero Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/50 font-medium text-xs mb-8 text-muted-foreground transition-colors hover:bg-muted">
                            <Badge variant="secondary" className="rounded-full px-2 py-0.5 h-5 text-[10px] bg-primary/10 text-primary border-0">NEW</Badge>
                            <span>The ultimate platform for builders</span>
                            <ArrowRight className="h-3 w-3" />
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
                            Build Software.<br />
                            <span className="text-primary relative inline-block">
                                Better Together.
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                            The all-in-one ecosystem for developers. Find your dream team, automate code reviews, and experience the joy of shipping faster.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                                <Button size="lg" className="h-14 px-8 rounded-full text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                                    {isLoggedIn ? "Go to Dashboard" : "Start Building"}
                                </Button>
                            </Link>
                            <Link href="/projects">
                                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-base bg-transparent border-input hover:bg-muted hover:text-foreground">
                                    Find Projects
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-foreground overflow-hidden">
                                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 5}`} alt="Avatar" className="w-full h-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-foreground font-bold">Join the movement</span>
                                <span className="text-xs">2,000+ builders shipping today</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Visual */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                         <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-3xl -z-10 opacity-50" />
                         
                         <div className="relative rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                            {/* Window Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
                                <div className="flex gap-2">
                                     <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                     <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                     <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                </div>
                                <div className="text-xs font-mono text-muted-foreground opacity-70">scanner.ts</div>
                            </div>
                            
                            {/* Code Content */}
                            <div className="p-6 font-mono text-sm bg-background/50">
                                  <div className="space-y-1">
                                      <div className="flex gap-4"><span className="text-muted-foreground w-4 select-none">1</span> <span><span className="text-purple-500">import</span> {'{'} scan {'}'} <span className="text-purple-500">from</span> <span className="text-green-500">'@buildhive/ai'</span>;</span></div>
                                      <div className="flex gap-4"><span className="text-muted-foreground w-4 select-none">2</span> <span></span></div>
                                      <div className="flex gap-4"><span className="text-muted-foreground w-4 select-none">3</span> <span><span className="text-purple-500">async function</span> <span className="text-blue-500">analyzeCode</span>(snippet) {'{'}</span></div>
                                      <div className="flex gap-4"><span className="text-muted-foreground w-4 select-none">4</span> <span>  <span className="text-muted-foreground">// Detect vulnerabilities</span></span></div>
                                      <div className="flex gap-4 bg-red-500/10 -mx-6 px-6 border-l-2 border-red-500"><span className="text-muted-foreground w-4 select-none">5</span> <span>  <span className="text-purple-500">const</span> flaws = <span className="text-purple-500">await</span> scan(snippet);</span></div>
                                      <div className="flex gap-4"><span className="text-muted-foreground w-4 select-none">6</span> <span>  <span className="text-purple-500">return</span> flaws;</span></div>
                                      <div className="flex gap-4"><span className="text-muted-foreground w-4 select-none">7</span> <span>{'}'}</span></div>
                                  </div>

                                  {/* Floating Alert */}
                                  <motion.div 
                                      initial={{ y: 20, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      transition={{ delay: 1 }}
                                      className="absolute bottom-6 right-6 z-10"
                                  >
                                      <div className="bg-card border p-4 rounded-xl shadow-xl flex items-start gap-4 max-w-[280px]">
                                          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                              <Shield className="h-4 w-4" />
                                          </div>
                                          <div>
                                              <p className="text-sm font-semibold mb-1">Scan Complete</p>
                                              <p className="text-xs text-muted-foreground">Found 0 critical issues. Code is clean and optimized.</p>
                                          </div>
                                      </div>
                                  </motion.div>
                            </div>
                         </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
