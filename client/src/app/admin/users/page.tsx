
"use client"

import { useEffect, useState } from "react"
import { getAllUsers, deleteUserAsAdmin, updateUserAsAdmin } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Shield, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
        const data = await getAllUsers(1, 100)
        setUsers(data.users)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return
      try {
          await deleteUserAsAdmin(id)
          toast.success("User deleted")
          loadUsers() // Reload list
      } catch (error) {
          toast.error("Failed to delete user")
      }
  }

  const handleRoleChange = async (id: string, currentRole: string) => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      try {
          await updateUserAsAdmin(id, { role: newRole })
           toast.success(`User role updated to ${newRole}`)
           loadUsers()
      } catch (error) {
           toast.error("Failed to update role")
      }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <Button onClick={loadUsers} variant="outline" size="sm">Refresh</Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                      <div className="flex flex-col">
                          <span className="font-medium">{user.name || "No Name"}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                      <Badge variant={user.role === 'admin' ? "destructive" : "secondary"}>
                          {user.role}
                      </Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline">{user.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role)}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  )
}
