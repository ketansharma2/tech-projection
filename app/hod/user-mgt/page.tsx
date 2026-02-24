'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users, Plus, Edit, Loader2, Check, User, ChevronDown, X } from 'lucide-react'
import { getCompanyTheme, type CompanySlug } from '@/lib/company-config'

type HeadSlug = 'dm' | 'data' | 'products'
type PreviewRole = 'USER' | 'HOD' | 'TL'
type StatusFilter = 'all' | 'active' | 'inactive'

const companyOptions: CompanySlug[] = ['maven', 'mks', 'savvi', 'profit-pathshala']

interface User {
  id: string
  userId: string
  name: string
  email: string
  designation: string
  role: PreviewRole
  companies: CompanySlug[]
  active: boolean
  profileUrl?: string | null
}

interface UserDraft {
  userId?: string
  name: string
  email: string
  designation: string
  role: PreviewRole
  companies: CompanySlug[]
  password?: string
  active: boolean
  profileImage?: File | null
  profileImageName?: string
}

function getDefaultDraft(): UserDraft {
  return {
    name: '',
    email: '',
    designation: '',
    role: 'USER',
    companies: [],
    password: '',
    active: true,
    profileImage: null,
  }
}

// Custom Badge Component
function Badge({ children, className = '', variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'outline' | 'brand' }) {
  const baseClasses = 'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors'
  const variants = {
    default: 'border border-transparent bg-muted text-foreground',
    outline: 'border border-[var(--brand-border)] text-foreground',
    brand: 'border-transparent bg-[var(--brand)] text-[var(--brand-foreground)]',
  }
  return (
    <span className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}

// Custom Button Component
function Button({ children, onClick, className = '', variant = 'default', type = 'button', size = 'default', disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: 'default' | 'outline' | 'brand'; type?: 'button' | 'submit'; size?: 'default' | 'sm' | 'lg'; disabled?: boolean }) {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const sizes = { default: 'h-9 px-4 py-2', sm: 'h-8 px-3 text-xs', lg: 'h-10 px-8' }
  const variants = {
    default: 'bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    brand: 'bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

// Custom Input Component
function Input({ value, onChange, placeholder, type = 'text', className = '', autoComplete }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; className?: string; autoComplete?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  )
}

// Custom Switch Component
function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--brand)] data-[state=unchecked]:bg-input ${checked ? 'bg-emerald-500' : 'bg-input'}`}
    >
      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

// Custom Table Components
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  )
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="[&_tr]:border-b">{children}</thead>
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
}

function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>
}

function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&:has([role=switch])]:pr-0 [&:has([role=checkbox])]:pl-4 ${className}`}>
      {children}
    </th>
  )
}

function TableCell({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 [&:has([role=switch])]:pr-0 [&:has([role=checkbox])]:pl-4 ${className}`}>{children}</td>
}

// Custom Dialog Components
function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50">{children}</div>
    </div>
  )
}

function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-background rounded-lg border shadow-lg ${className}`}>
      {children}
    </div>
  )
}

function DialogHeader({ title, description }: { title: React.ReactNode; description: React.ReactNode }) {
  return (
    <div className="text-left p-3 py-4 flex items-center gap-3 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
      <div 
        className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0" 
        style={{ backgroundColor: '#e0f2fe', color: '#103c7f' }}
      >
        <User className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-xl font-bold" style={{ color: '#103c7f' }}>
          {title}
        </h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#e0f2fe', color: '#103c7f' }}>
        <User className="h-5 w-5" />
      </div>
      <span>{children}</span>
    </h2>
  )
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4">{children}</div>
}

// Custom Multi-Select Dropdown Component
function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select options'
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const displayText = selected.length > 0 
    ? selected.map(s => s.toUpperCase()).join(', ')
    : placeholder

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        >
          <span className={selected.length === 0 ? 'text-muted-foreground' : ''}>
            {displayText}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-white shadow-lg">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HodUserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | PreviewRole>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanySlug>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draft, setDraft] = useState<UserDraft>(getDefaultDraft())
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/hod/users')
      const data = await response.json()
      if (data.users) {
        // Transform API users to match our interface
        const transformedUsers: User[] = data.users.map((u: any) => ({
          id: u.id,
          userId: u.user_id || u.id,
          name: u.name,
          email: u.email,
          designation: u.designation || '',
          role: u.role === 'HOD' ? 'HOD' as PreviewRole : u.role === 'TL' ? 'TL' as PreviewRole : 'USER' as PreviewRole,
          companies: u.company ? (Array.isArray(u.company) ? u.company.map((c: string) => c.toLowerCase()) : [u.company.toLowerCase()]) : ['maven'],
          active: u.is_active === 'Yes',
          profileUrl: u.profile_url || null,
        }))
        setUsers(transformedUsers)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadUsers()
    }
  }, [mounted, loadUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = query.trim().toLowerCase()
      const matchesQuery =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.designation.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.active : !user.active)
      const matchesCompany = companyFilter === 'all' || user.companies.includes(companyFilter as CompanySlug)

      return matchesQuery && matchesRole && matchesStatus && matchesCompany
    })
  }, [users, query, roleFilter, statusFilter, companyFilter])

  // Show loading state until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </main>
    )
  }

  const openAddDialog = () => {
    setDraft({
      name: '',
      email: '',
      designation: '',
      role: 'USER',
      companies: [],
      password: '',
      active: true,
      profileImage: null,
    })
    setProfilePreview(null)
    setFormError('')
    setSuccessMessage(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setDraft({
      userId: user.userId,
      name: user.name,
      email: user.email,
      designation: user.designation,
      role: user.role,
      companies: user.companies,
      active: user.active,
    })
    setFormError('')
    setSuccessMessage(null)
    setIsDialogOpen(true)
  }

  const handleSaveDraft = async () => {
    if (!draft.name.trim() || !draft.designation.trim()) {
      setFormError('Name and designation are required.')
      return
    }
    if (!draft.companies || draft.companies.length === 0) {
      setFormError('Select at least one company.')
      return
    }
    if (!draft.userId && !draft.password) {
      setFormError('Password is required for new users.')
      return
    }

    setSaving(true)
    try {
      // Use FormData if there's a profile image
      if (draft.profileImage) {
        const formData = new FormData()
        formData.append('name', draft.name.trim())
        formData.append('email', draft.email.trim())
        formData.append('designation', draft.designation.trim())
        formData.append('role', draft.role === 'USER' ? 'User' : 'HOD')
        formData.append('companies', JSON.stringify(draft.companies.map(c => c.toUpperCase())))
        formData.append('is_active', draft.active ? 'Yes' : 'No')
        formData.append('file', draft.profileImage)
        
        if (draft.password) {
          formData.append('password', draft.password)
        }

        const response = await fetch('/api/hod/users', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setSuccessMessage('User Creation Successful')
          setTimeout(() => {
            setIsDialogOpen(false)
            setSuccessMessage(null)
          }, 1500)
          await loadUsers()
        } else {
          const data = await response.json()
          setFormError(data.error || 'Failed to save user')
        }
      } else {
        // Original JSON payload for updates or creates without image
        const payload: any = {
          name: draft.name.trim(),
          email: draft.email.trim(),
          designation: draft.designation.trim(),
          role: draft.role === 'USER' ? 'User' : draft.role === 'TL' ? 'TL' : 'HOD',
          companies: draft.companies.map(c => c.toUpperCase()),
          is_active: draft.active ? 'Yes' : 'No',
        }

        // Only include password for new users
        if (!draft.userId && draft.password) {
          payload.password = draft.password
        }

        const url = draft.userId 
          ? `/api/hod/users/${draft.userId}`
          : '/api/hod/users'
        
        const method = draft.userId ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          setSuccessMessage('User Creation Successful')
          setTimeout(() => {
            setIsDialogOpen(false)
            setSuccessMessage(null)
          }, 1500)
          await loadUsers()
        } else {
          const data = await response.json()
          setFormError(data.error || 'Failed to save user')
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      setFormError('Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const toggleUserActive = async (user: User, nextActive: boolean) => {
    try {
      const response = await fetch(`/api/hod/users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          designation: user.designation,
          role: user.role === 'HOD' ? 'HOD' : user.role === 'TL' ? 'TL' : 'User',
          companies: user.companies.map(c => c.toUpperCase()),
          is_active: nextActive ? 'Yes' : 'No',
        })
      })

      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Format file size
      const fileSizeKB = file.size / 1024
      let fileSizeText: string
      if (fileSizeKB < 1024) {
        fileSizeText = `${fileSizeKB.toFixed(1)} KB`
      } else {
        fileSizeText = `${(fileSizeKB / 1024).toFixed(1)} MB`
      }
      const fileNameWithSize = `${file.name} (${fileSizeText})`
      
      setDraft((prev) => ({ ...prev, profileImage: file, profileImageName: fileNameWithSize }))
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="pt-24 pb-16 min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#e0f2fe', color: '#103c7f' }}
            >
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#103c7f' }}>
                User Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage access, role, company scope
              </p>
            </div>
          </div>
          
          <Button onClick={openAddDialog} className="!bg-[#103c7f] !text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm mb-6">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <Input
              placeholder="Search by name, position or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'all' | PreviewRole)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="HOD">HOD</option>
              <option value="TL">TL</option>
              <option value="USER">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={companyFilter}
              onChange={(event) => setCompanyFilter(event.target.value as 'all' | CompanySlug)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Companies</option>
              {companyOptions.map((company) => (
                <option key={company} value={company}>
                  {getCompanyTheme(company).switcherName || getCompanyTheme(company).name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <section className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Designation</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Role</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Companies</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Active</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No users found for current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profileUrl ? (
                            <img 
                              src={user.profileUrl} 
                              alt={user.name} 
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div 
                              className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                              style={{ backgroundColor: '#e0f2fe', color: '#103c7f' }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{user.designation}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'HOD' ? 'brand' : 'default'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.companies.map((company) => {
                            const theme = getCompanyTheme(company)
                            return (
                              <span 
                                key={company}
                                className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                                style={{ 
                                  backgroundColor: theme.primaryColor, 
                                  color: 'white'
                                }}
                              >
                                {company.toUpperCase()}
                              </span>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.active} onCheckedChange={(checked) => toggleUserActive(user, checked)} />
                          <span className="text-xs text-muted-foreground">{user.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader
           
            title={draft.userId ? 'Edit User' : 'Add User'}
            description="Configure role, company access, and development head scope."
          />

          <div className="space-y-4 p-6 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Name *</label>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Enter user name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Designation *
                </label>
                <Input
                  value={draft.designation}
                  onChange={(event) => setDraft((prev) => ({ ...prev, designation: event.target.value }))}
                  placeholder="Enter designation"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              {!draft.userId && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Password *
                  </label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={draft.password || ''}
                    onChange={(event) => setDraft((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
              )}
            </div>

            {!draft.userId && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-16 w-16 rounded-full overflow-hidden border border-border flex items-center justify-center"
                    style={{ backgroundColor: '#f1f5f9' }}
                  >
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="text-sm text-muted-foreground"
                  />
                  {draft.profileImageName && (
                    <span className="text-xs text-muted-foreground ml-2">{draft.profileImageName}</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Role</label>
                <select
                  value={draft.role}
                  onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value as PreviewRole }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="USER">User</option>
                  <option value="HOD">HOD</option>
                  <option value="TL">TL</option>
                </select>
              </div>

              <MultiSelect
                label="Companies"
                options={companyOptions.map(c => ({ value: c, label: c.toUpperCase() }))}
                selected={draft.companies}
                onChange={(selected) => setDraft((prev) => ({ ...prev, companies: selected as CompanySlug[] }))}
                placeholder="Select companies"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Active</label>
              <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3">
                <Switch
                  checked={draft.active}
                  onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, active: checked }))}
                />
                <span className="text-sm text-foreground">{draft.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}
            {successMessage ? <p className="text-sm font-medium text-green-600">{successMessage}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="!bg-[#103c7f] !text-white" onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {saving ? 'Please Wait ! Creating User.......' : 'Save User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
