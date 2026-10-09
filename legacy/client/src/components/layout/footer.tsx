
import Link from "next/link"
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                 <div className="h-3 w-3 bg-background rounded-sm" />
               </div>
               <span className="font-bold text-lg">vibeship</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI workflow OS for developers who want to vibe-code faster and ship better output.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <FaGithub className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <FaLinkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Workflows</Link></li>
              <li><Link href="/" className="hover:text-foreground">Prompt Packs</Link></li>
              <li><Link href="/" className="hover:text-foreground">Roadmaps</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">About</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/projects" className="hover:text-foreground">Community</Link></li>
              <li><Link href="/settings/profile" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/settings" className="hover:text-foreground">Settings</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} vibeship. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
