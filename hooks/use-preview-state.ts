'use client'

import { useState, useEffect } from 'react'

interface UserInfo {
  userId: string
  userAuthId: string
  name: string
  position: string
  email: string
  profile_url?: string
}

interface PreviewState {
  role: 'HOD' | 'USER'
  selectedUserId: string | null
  users: UserInfo[]
  selectedUser: UserInfo | null
  setRole: (role: 'HOD' | 'USER') => void
  setSelectedUserId: (userId: string | null) => void
}

export function usePreviewState(): PreviewState {
  const [role, setRole] = useState<'HOD' | 'USER'>('USER')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<UserInfo[]>([])
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null)

  // Fetch users when in HOD mode
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.usersWithId && Array.isArray(data.usersWithId)) {
          const formattedUsers: UserInfo[] = data.usersWithId.map((u: Record<string, string>) => ({
            userId: u.id,
            userAuthId: u.auth_id || u.id,
            name: u.name || 'Unknown',
            position: u.position || 'Team Member',
            email: u.email || '',
            profile_url: u.profile_url || '',
          }))
          setUsers(formattedUsers)
          
          // Set default selected user in HOD mode
          if (formattedUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(formattedUsers[0].userId)
            setSelectedUser(formattedUsers[0])
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    if (role === 'HOD') {
      fetchUsers()
    }
  }, [role])

  // Handle role change
  const handleSetRole = (newRole: 'HOD' | 'USER') => {
    setRole(newRole)
    if (newRole === 'USER') {
      // Reset to null in USER mode - user info will come from auth context
      setSelectedUserId(null)
      setSelectedUser(null)
    }
  }

  return {
    role,
    selectedUserId,
    users,
    selectedUser,
    setRole: handleSetRole,
    setSelectedUserId,
  }
}
