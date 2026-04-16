"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Target,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";

const USER_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Onboarding", href: "/onboarding", icon: Target },
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Billing", href: "/settings/billing", icon: BarChart3 },
  { label: "Settings", href: "/settings/account", icon: Settings },
];

function UserSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {USER_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarPanel() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border/80 bg-card px-4 py-5">
      <Link href="/" className="px-2 pb-6 pt-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">vibeship</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Workspace</h2>
      </Link>

      <div className="px-2 pb-4">
        <Link href="/projects/new">
          <Button className="w-full justify-start rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <UserSidebarNav />
      </div>

      <div className="border-t border-border/70 px-2 pt-4">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

export function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <SidebarPanel />
        </div>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 h-14 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
            <div className="flex h-full items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[290px] p-0">
                    <SidebarPanel />
                  </SheetContent>
                </Sheet>

                <p className="text-sm capitalize text-muted-foreground">
                  {segment} <span className="text-foreground">/ space</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/projects/new">
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                </Link>
                <UserNav />
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
