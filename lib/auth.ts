// User types
export interface User {
  id: string
  name: string
  email: string
  role: string
  company: string | null
  is_active: string
}

export interface Session {
  accessToken: string
  expiresAt: string
}

// Get user from localStorage
export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

// Get session from localStorage
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  
  const sessionStr = localStorage.getItem('session')
  if (!sessionStr) return null
  
  try {
    return JSON.parse(sessionStr) as Session
  } catch {
    return null
  }
}

// Check if session is valid (not expired)
export function isSessionValid(): boolean {
  const session = getSession()
  if (!session) return false
  
  const expiresAt = new Date(session.expiresAt)
  return expiresAt.getTime() > Date.now()
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return isSessionValid() && getUser() !== null
}

// Logout - clear localStorage
export function logout(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('user')
  localStorage.removeItem('session')
  
  // Also clear Supabase auth token from localStorage
  const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'))
  supabaseKeys.forEach(key => localStorage.removeItem(key))
}
