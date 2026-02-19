'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginResponse {
  success?: boolean
  message?: string
  error?: string
  user?: {
    id: string
    name: string
    email: string
    role: string
    company: string | null
    is_active: string
  }
  session?: {
    expiresAt: string
  }
  accessToken?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.user!.id,
        name: data.user!.name,
        email: data.user!.email,
        role: data.user!.role,
        company: data.user!.company,
        is_active: data.user!.is_active
      }))

      // Store session info in localStorage
      localStorage.setItem('session', JSON.stringify({
        accessToken: data.accessToken,
        expiresAt: data.session!.expiresAt
      }))

      // Redirect based on user role
      const company = (data.user!.company || 'maven').toLowerCase()
      const userRole = data.user!.role
      
      // If role is 'User', redirect to user folder, otherwise to admin folder
      const redirectPath = userRole === 'User' 
        ? `/user/${company}/development` 
        : `/admin/${company}/development`
      
      // Use window.location for more reliable redirect
      window.location.href = redirectPath

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
