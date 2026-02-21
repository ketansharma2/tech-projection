'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { companyThemeConfig, getCompanyTheme } from '@/lib/company-config'

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
    profile_url?: string
    designation?: string
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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const companyTheme = getCompanyTheme('maven')

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
        is_active: data.user!.is_active,
        profile_url: data.user!.profile_url || '',
        designation: data.user!.designation || ''
      }))

      // Store session info in localStorage
      localStorage.setItem('session', JSON.stringify({
        accessToken: data.accessToken,
        expiresAt: data.session!.expiresAt
      }))

      // Redirect based on user role
      const company = (data.user!.company || 'maven').toLowerCase()
      const userRole = data.user!.role
      
      let redirectPath: string
      if (userRole === 'User') {
        redirectPath = `/user/${company}`
      } else if (userRole === 'HOD') {
        redirectPath = `/hod/${company}`
      } else {
        redirectPath = `/hod/${company}`
      }
      
      window.location.href = redirectPath

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #F0F4F8 0%, #E6EEF8 100%)' }}>
      {/* Company Logos Container */}
      <div className="mb-12">
        <div className="flex items-center gap-6">
          {Object.values(companyThemeConfig).map((company) => (
            <div
              key={company.slug}
              className="flex flex-col items-center gap-3"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 shadow-lg p-4"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
              >
                {company.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt={`${company.name} Logo`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold" style={{ color: company.primaryColor }}>
                    {company.logoInitials}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">{company.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Container */}
      <Card className="w-full max-w-md border border-gray-200 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>Welcome Back</h2>
            <p style={{ color: '#0F172A' }}>Sign In</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-4 border-gray-200 focus:border-gray-400 focus:ring-gray-200"
                required
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-4 pr-10 border-gray-200 focus:border-gray-400 focus:ring-gray-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#1D4ED8' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
