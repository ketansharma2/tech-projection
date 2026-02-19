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
      const company = (user?.company || 'maven').toLowerCase()
      router.push(`/${company}/development/dm`)
    } else {
      // Not logged in, redirect to login page
      router.push('/login')
    }
  }, [router])

  return null
}

