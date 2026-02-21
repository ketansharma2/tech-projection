'use client'

import { useEffect, useMemo, useState, use, useRef } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Loader2,
  X,
  Check,
  User,
} from 'lucide-react'
import { getCompanyTheme, type CompanySlug } from '@/lib/company-config'

// Generate company-specific colors
function getCompanyColors(primaryColor: string) {
  return {
    primaryColor,
    bgLight: adjustColor(primaryColor, 95, true),
    bgSubtle: adjustColor(primaryColor, 90, true),
    border: adjustColor(primaryColor, 80, true),
  }
}

function adjustColor(hex: string, percent: number, isLight = false): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)
}

type HeadSlug = 'dm' | 'data' | 'products'
type PreviewRole = 'USER' | 'HOD'
type StatusFilter = 'all' | 'active' | 'inactive'

const companyOptions: CompanySlug[] = ['maven', 'mks', 'savvi', 'profit-pathshala']

interface User {
  id: string
  userId: string
  name: string
  email: string
  designation: string
  role: PreviewRole
  company: CompanySlug
  active: boolean
  profileUrl?: string | null
}

interface UserDraft {
  userId?: string
  name: string
  email: string
  designation: string
  role: PreviewRole
  company: CompanySlug
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
    company: 'maven',
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

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0">{children}</div>
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4">{children}</div>
}

export default function HodUserManagementPage({
  params,
}: {
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = use(params)
  
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
  
  const theme = getCompanyTheme(companySlug)
  const colors = getCompanyColors(theme.primaryColor)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
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
          role: u.role === 'HOD' ? 'HOD' as PreviewRole : 'USER' as PreviewRole,
          company: u.company ? u.company.toLowerCase() as CompanySlug : 'maven',
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
  }

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
      const matchesCompany = companyFilter === 'all' || user.company === companyFilter

      return matchesQuery && matchesRole && matchesStatus && matchesCompany
    })
  }, [users, query, roleFilter, statusFilter, companyFilter])

  const openAddDialog = () => {
    setDraft({
      name: '',
      email: '',
      designation: '',
      role: 'USER',
      company: 'maven',
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
      company: user.company,
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
    if (!draft.company) {
      setFormError('Select a company.')
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
        formData.append('company', draft.company.toUpperCase())
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
          role: draft.role === 'USER' ? 'User' : 'HOD',
          company: draft.company.toUpperCase(),
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
          role: user.role === 'HOD' ? 'HOD' : 'User',
          company: user.company.toUpperCase(),
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
    <main className="pt-24 pb-16 min-h-screen" style={{ backgroundColor: colors.bgLight }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.bgSubtle, color: colors.primaryColor }}
            >
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.primaryColor }}>
                User Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage access, role, company scope
              </p>
            </div>
          </div>
          
          <Button onClick={openAddDialog} variant="brand">
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
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primaryColor }} />
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
                              style={{ backgroundColor: colors.bgSubtle, color: colors.primaryColor }}
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
                        <Badge variant="outline">
                          {user.company.toUpperCase()}
                        </Badge>
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
          <DialogHeader>
            <DialogTitle>{draft.userId ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription>Configure role, company access, and development head scope.</DialogDescription>
          </DialogHeader>

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
                    style={{ backgroundColor: colors.bgSubtle }}
                  >
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8" style={{ color: colors.primaryColor }} />
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

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Role</label>
              <select
                value={draft.role}
                onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value as PreviewRole }))}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="USER">User</option>
                <option value="HOD">HOD</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Company</label>
              <select
                value={draft.company}
                onChange={(event) => setDraft((prev) => ({ ...prev, company: event.target.value as CompanySlug }))}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a company</option>
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company.toUpperCase()}
                  </option>
                ))}
              </select>
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
            <Button variant="brand" onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {saving ? 'Please Wait ! Creating User.......' : 'Save User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
