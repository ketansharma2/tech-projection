'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, getUser } from '@/lib/auth'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    if (isLoggedIn()) {
      const user = getUser()
      const company = (user?.company ? (Array.isArray(user.company) ? user.company[0] : user.company) : 'maven').toLowerCase()
      const role = user?.role || 'User'
      
      // Redirect based on user role
      let redirectPath: string
      if (role === 'User') {
        redirectPath = `/user/${company}/development/dm`
      } else {
        // HOD, Admin, or any other role goes to /hod
        redirectPath = `/hod/${company}/development/dm`
      }
      
      router.push(redirectPath)
    } else {
      // Not logged in, redirect to login page
      router.push('/login')
    }
  }, [router])

  return null
}

