'use client'

import { ChevronLeft, LogOut } from 'lucide-react'
import { logout } from '@/lib/auth'
import { useParams, usePathname } from 'next/navigation'

export default function Header() {
  const params = useParams()
  const pathname = usePathname()
  const companySlug = params?.companySlug as string | undefined
  
  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  // Determine the back URL based on current path
  const getBackUrl = () => {
    if (!companySlug) return '/'
    // If we're in /user/[companySlug]/..., go to /user/[companySlug]/development
    if (pathname?.includes('/user/')) {
      return `/user/${companySlug}/development`
    }
    // If we're in /admin/[companySlug]/..., go to /admin/[companySlug]/development
    if (pathname?.includes('/admin/')) {
      return `/admin/${companySlug}/development`
    }
    return `/`
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <span className="text-base font-semibold text-blue-950 dark:text-blue-100 hidden sm:inline">Maven Jobs</span>
          </div>

          {/* Right: Navigation Links */}
          <nav className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all duration-200 group" onClick={() => window.location.href = getBackUrl()}>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <a href="#" className="px-3.5 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all duration-200">
              Development
            </a>
            <a href="#" className="px-3.5 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all duration-200">
              Data Mgmt
            </a>
            <a href="#" className="px-3.5 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all duration-200">
              Products
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
