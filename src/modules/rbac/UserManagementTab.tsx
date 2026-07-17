import React, { useState } from 'react'
import { UserPlus, KeyRound, Lock } from 'lucide-react'
import { mockUsers } from './mocks/users.mock'
import type { RBACUser, Role } from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle } from 'lucide-react'

const ROLES: Role[] = ['Admin', 'Operator', 'Auditor']

const roleBadge: Record<Role, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  Operator: 'bg-blue-100 text-blue-700',
  Auditor: 'bg-gray-100 text-gray-600',
}

interface Toast {
  id: number
  message: string
}

let toastId = 0

export default function UserManagementTab() {
  const [users, setUsers] = useState<RBACUser[]>(mockUsers)
  const [open, setOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Add user form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<Role | ''>('')

  function showToast(message: string) {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500)
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    const newUser: RBACUser = {
      id: `u${Date.now()}`,
      name: fullName,
      email,
      role,
      status: 'Active',
    }
    setUsers((prev) => [...prev, newUser])
    setOpen(false)
    setFullName('')
    setEmail('')
    setUsername('')
    setRole('')
    showToast('User created successfully')
  }

  function handleAssignRole(id: string) {
    showToast('Role assigned successfully')
  }

  function handleToggleLock(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' }
          : u
      )
    )
    showToast('User status updated')
  }

  function handleResetPassword(id: string) {
    showToast('Password reset email sent')
  }

  return (
    <div className="space-y-4">
      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-md pointer-events-auto"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-end">
        <Button
          className="bg-[#1565C0] hover:bg-[#0d47a1] text-white gap-1.5"
          onClick={() => setOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[user.role]}`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignRole(user.id)}
                    >
                      <KeyRound className="h-3.5 w-3.5 mr-1" />
                      Assign Role
                    </Button>
                    <Button
                      size="sm"
                      className={`text-white ${
                        user.status === 'Active'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      onClick={() => handleToggleLock(user.id)}
                    >
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      {user.status === 'Active' ? 'Lock' : 'Unlock'}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset Password
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="px-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)} required>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="px-0 pb-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1565C0] hover:bg-[#0d47a1] text-white"
              >
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
