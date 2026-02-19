'use client'

import { LogOut } from 'lucide-react'
import { logout } from '@/lib/auth'

export default function LogoutButton() {
  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  )
}
