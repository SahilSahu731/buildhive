"use client"

import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getMyProfile } from "@/lib/api"
import Link from "next/link"
import { CreditCard, History, LayoutDashboard, LogOut, Settings, User, ShieldAlert } from "lucide-react"

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const loadUser = async () => {
        try {
            const data = await getMyProfile();
            setUser(data);
        } catch (e) {
            console.error("Failed to load user for nav", e);
        }
    }
    loadUser();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || "@user"} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user?.role === 'admin' && (
             <Link href="/admin">
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                   <ShieldAlert className="mr-2 h-4 w-4" />
                   Admin Panel
                </DropdownMenuItem>
             </Link>
          )}
          <Link href="/dashboard">
            <DropdownMenuItem>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
            </DropdownMenuItem>
          </Link>
          <Link href={user?.githubUsername ? `/profile/${user.githubUsername}` : "/settings/profile"}>
            <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href="/code-review/history">
            <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                My Reviews
            </DropdownMenuItem>
          </Link>
          <Link href="/settings/billing">
            <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings/profile">
            <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
