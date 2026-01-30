"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Code2, Users, Rocket, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <motion.div 
                className="flex flex-col justify-center space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm bg-muted/50">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    v1.0 is now live
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-7xl/none">
                    Build Faster, <span className="text-primary">Together.</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    The ultimate platform for developers to find teammates, showcase portfolios, and ship side-projects that matter.
                  </p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="h-12 px-8 text-base group">
                      Get Started 
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                      Learn More
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                        U{i}
                      </div>
                    ))}
                  </div>
                  <p>Joined by 1,000+ developers</p>
                </motion.div>
              </motion.div>

              <motion.div 
                className="relative mx-auto lg:ml-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative h-[400px] w-[400px] sm:h-[500px] sm:w-[500px] lg:h-[600px] lg:w-[600px]">
                   {/* Abstract Glowing Orb/Shape usually goes here, we use the image */}
                   <Image 
                     src="/images/hero_abstract.png" 
                     alt="BuildHive Collaboration" 
                     fill 
                     className="object-contain drop-shadow-2xl"
                     priority
                   />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl -z-10" />
                <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need to ship</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                 Stop building in isolation. BuildHive gives you the tools to find the perfect squad and manage your projects effortlessly.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div 
                whileHover={{ y: -5 }} 
                className="relative group overflow-hidden rounded-2xl border bg-background p-8 hover:shadow-lg transition-all"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Team Matching</h3>
                <p className="text-muted-foreground">
                  Our AI-driven algorithm matches you with developers who have complementary skills and shared interests.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }} 
                className="relative group overflow-hidden rounded-2xl border bg-background p-8 hover:shadow-lg transition-all"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Rocket className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Project Launchpad</h3>
                <p className="text-muted-foreground">
                  From idea to MVP. Use our built-in templates and project management tools to keep your team on track.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }} 
                className="relative group overflow-hidden rounded-2xl border bg-background p-8 hover:shadow-lg transition-all"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Smart Portfolio</h3>
                <p className="text-muted-foreground">
                  Showcase your contributions automatically. We sync with GitHub to build a dynamic portfolio of your work.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits / List Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
             <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 relative h-[400px] rounded-2xl overflow-hidden border bg-muted/50">
                    {/* Placeholder for a UI screenshot or feature demo */}
                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      UI Dashboard Mockup
                   </div>
                </div>
                <div className="order-1 lg:order-2 space-y-8">
                   <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Focus on code, not logistics</h2>
                   <ul className="space-y-4">
                      {[
                        "Instant project setup with best-practice templates",
                        "Integrated chat and video conferencing for teams",
                        "Automated task distribution based on commits",
                        "One-click deployment integrations"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                           <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                           <span className="text-lg text-muted-foreground">{item}</span>
                        </li>
                      ))}
                   </ul>
                   <Button size="lg" variant="secondary">See how it works</Button>
                </div>
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
           <div className="container px-4 md:px-6 mx-auto relative z-10 text-center space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to build your dream project?</h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                 Join thousands of developers turning ideas into reality today.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold bg-background text-foreground hover:bg-background/90">
                  Join BuildHive Now
                </Button>
              </Link>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
