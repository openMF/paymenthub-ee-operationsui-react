import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TENANTS = ['greenbank', 'bluebank', 'redbank']

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tenant, setTenant] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username === 'mifos' && password === 'password') {
      navigate('/')
    } else {
      alert('Invalid credentials. Use mifos / password.')
    }
  }

  return (
    <div className="min-h-screen bg-[#1565C0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/payment-hub-ee.png"
            alt="Payment Hub EE"
            className="h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">Payment Hub EE</p>
            <p className="text-sm text-muted-foreground">Operations</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-8 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tenant */}
          <div className="space-y-1.5">
            <Label htmlFor="tenant">Tenant</Label>
            <Select value={tenant} onValueChange={setTenant} required>
              <SelectTrigger id="tenant" className="w-full">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {TENANTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(Boolean(v))}
            />
            <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#1565C0] hover:bg-[#0d47a1] text-white"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Powered by Mifos Initiative
        </p>
      </div>
    </div>
  )
}
