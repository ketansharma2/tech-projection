'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown,
    Check,
    Monitor,
    Package,
    BarChart3,
    Database,
    Users,
    Settings,
    User as UserIcon,
    LogOut,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { allCompanies, getCompanyTheme, type CompanyTheme } from '@/lib/company-config'
import { usePreviewState } from '@/hooks/use-preview-state'
import { logout, getUser, type User as AuthUser } from '@/lib/auth'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Mode = 'Development' | 'Operations' | null
type Head = 'Digital Marketing' | 'Data Management' | 'Products'

const HEAD_OPTIONS: { label: Head; path: (slug: string) => string; icon: React.ReactNode }[] = [
    { label: 'Digital Marketing', path: (s) => `/${s}/development/dm`, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Data Management', path: (s) => `/${s}/development/data`, icon: <Database className="w-4 h-4" /> },
    { label: 'Products', path: (s) => `/${s}/development/products`, icon: <Package className="w-4 h-4" /> },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function deriveState(pathname: string): { mode: Mode | null; head: Head | null } {
    // Quick check for operations
    if (pathname.includes('/operations')) return { mode: 'Operations', head: null }
    
    // Quick check for development
    if (pathname.includes('/development')) {
        // Check for specific sub-depts
        if (pathname.endsWith('/dm') || pathname.includes('/development/dm')) {
            return { mode: 'Development', head: 'Digital Marketing' }
        }
        if (pathname.endsWith('/data') || pathname.includes('/development/data')) {
            return { mode: 'Development', head: 'Data Management' }
        }
        if (pathname.endsWith('/products') || pathname.includes('/development/products')) {
            return { mode: 'Development', head: 'Products' }
        }
        // On development main page - no specific head
        return { mode: 'Development', head: null }
    }
    
    // Not on a module-specific route
    return { mode: null, head: null }
}

// ─────────────────────────────────────────────
// Company Logo
// ─────────────────────────────────────────────
function CompanyLogo({ theme, size = 40 }: { theme: CompanyTheme; size?: number }) {
    return (
        <img
            src={theme.logoUrl}
            alt={theme.name}
            className="rounded-xl object-contain"
            style={{
                width: size,
                height: size,
            }}
        />
    )
}

// ─────────────────────────────────────────────
// Nav trigger button
// ─────────────────────────────────────────────
function NavTrigger({
    label,
    sublabel,
    open,
    disabled,
}: {
    label: string
    sublabel: string
    open?: boolean
    disabled?: boolean
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all select-none
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${open ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
            <span className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-normal text-slate-400 mb-0.5">{sublabel}</span>
                <span>{label}</span>
            </span>
            <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            />
        </span>
    )
}

// ─────────────────────────────────────────────
// Dropdown item
// ─────────────────────────────────────────────
function DropItem({
    label,
    sublabel,
    active,
    icon,
    onClick,
}: {
    label: string
    sublabel?: string
    active?: boolean
    icon?: React.ReactNode
    onClick?: () => void
}) {
    return (
        <DropdownMenuItem
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors
        ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
        >
            {icon && <span className="flex-shrink-0 text-slate-400 group-hover:text-slate-600">{icon}</span>}
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium leading-tight truncate">{label}</span>
                {sublabel && <span className="block text-xs text-slate-400 mt-0.5 truncate">{sublabel}</span>}
            </span>
            {active && <Check className="w-4 h-4 text-slate-700 flex-shrink-0" />}
        </DropdownMenuItem>
    )
}

// ─────────────────────────────────────────────
// Role segmented toggle
// ─────────────────────────────────────────────
function RoleToggle({
    value,
    onChange,
}: {
    value: 'HOD' | 'USER'
    onChange: (v: 'HOD' | 'USER') => void
}) {
    return (
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {(['HOD', 'USER'] as const).map((r) => (
                <button
                    key={r}
                    onClick={() => onChange(r)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${value === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {r} View
                </button>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────
// Separator
// ─────────────────────────────────────────────
function Sep() {
    return <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1" />
}

// ─────────────────────────────────────────────
// Main AppHeader
// ─────────────────────────────────────────────
interface AppHeaderProps {
    companySlug: string
    variant?: 'user' | 'hod'
}

export default function AppHeader({ companySlug, variant = 'hod' }: AppHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const theme = getCompanyTheme(companySlug)
    const { mode, head } = deriveState(pathname)

    // Use the project-wide preview state
    const { role, selectedUserId, users, selectedUser, setRole, setSelectedUserId } = usePreviewState()
    const isHOD = role === 'HOD'
    
    // Get logged in user from localStorage after hydration to avoid mismatch
    const [loggedInUser, setLoggedInUser] = React.useState<AuthUser | null>(null)
    const [mounted, setMounted] = React.useState(false)
    
    React.useEffect(() => {
        setLoggedInUser(getUser())
        setMounted(true)
    }, [])
    
    // Display based on role - use defaults to avoid SSR mismatch
    // Use selectedUser in HOD mode, otherwise use loggedInUser (from auth)
    const displayName = !mounted ? 'User' : (isHOD && selectedUser?.name) ? selectedUser.name : (loggedInUser?.name || 'User')
    const displayRole = !mounted ? 'Head of Department' : (isHOD 
        ? (selectedUser?.position || 'Head of Department')
        : (loggedInUser?.role || 'Team Member'))
    const displayProfileUrl = !mounted ? '' : (isHOD ? selectedUser?.profile_url : loggedInUser?.profile_url)
    const displayDesignation = !mounted ? '' : (isHOD ? (selectedUser?.designation || '') : (loggedInUser?.designation || ''))
    const displayEmail = !mounted ? '' : (isHOD ? '' : (loggedInUser?.email || ''))
    // Show user role instead of company in the collapsed profile section
    const displayCompany = !mounted ? '' : (loggedInUser?.role || '')
    const initials = !mounted ? 'U' : displayName.charAt(0).toUpperCase()

    // Get user's allowed companies (for User role, filter to only show user's companies)
    const getUserCompanies = (): CompanyTheme[] => {
        if (!mounted) return []
        const userCompany = loggedInUser?.company
        
        // If HOD, show all companies
        if (variant === 'hod') {
            return allCompanies
        }
        
        // If User, filter to only user's companies
        // Handle both array and string formats for backward compatibility
        // Use case-insensitive comparison
        if (Array.isArray(userCompany)) {
            // New format: array of company slugs (may be uppercase)
            return allCompanies.filter(c => 
                userCompany.some(uc => uc.toLowerCase() === c.slug.toLowerCase())
            )
        } else if (typeof userCompany === 'string' && userCompany) {
            // Old format: single company string
            return allCompanies.filter(c => 
                c.slug.toLowerCase() === userCompany.toLowerCase()
            )
        }
        // If no company data, return empty array
        return []
    }
    
    const userCompanies = getUserCompanies()

    // Get the path prefix (user/hod) from current URL
    const getPathPrefix = () => {
        const parts = pathname.split('/')
        // parts: ['', 'user', 'maven', 'development', 'dm'] or ['', 'maven', 'development']
        // If parts[1] is 'user' or 'hod', use it as prefix
        if (parts[1] === 'user' || parts[1] === 'hod') {
            return parts[1]
        }
        return '' // for root level pages
    }

    // Navigation helpers
    const getHeadPath = React.useCallback(
        (h: Head) => {
            const prefix = getPathPrefix()
            const pathPrefix = prefix ? `/${prefix}` : ''
            const opt = HEAD_OPTIONS.find((o) => o.label === h)
            return opt ? `${pathPrefix}/${companySlug}${opt.path(companySlug).replace(`/${companySlug}`, '')}` : `${pathPrefix}/${companySlug}/development/dm`
        },
        [companySlug, pathname],
    )

    const navigateMode = (newMode: Mode) => {
        if (!newMode) return // Don't navigate if null
        const prefix = getPathPrefix()
        const pathPrefix = prefix ? `/${prefix}` : ''
        if (newMode === 'Operations') {
            router.push(`${pathPrefix}/${companySlug}/operations`)
        } else {
            // Go to development main page instead of a specific sub-department
            router.push(`${pathPrefix}/${companySlug}/development`)
        }
    }

    const navigateHead = (h: Head) => {
        router.push(getHeadPath(h))
    }

    const switchCompany = (slug: string) => {
        // Get current path parts: ['', 'user', 'maven', 'development', 'dm'] or ['', 'maven', 'development']
        const parts = pathname.split('/')
        // Company slug is always at index 2
        // Replace it with new slug
        parts[2] = slug
        // Join and navigate
        router.push(parts.join('/'))
    }

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white px-6"
            style={{ height: 72 }}
            suppressHydrationWarning
        >
            {/* LEFT: Company logo + switcher chevron */}
            <div className="flex items-center gap-2">
                <Link href={`/${variant}/${companySlug}`} className="flex-shrink-0 focus:outline-none">
                    <CompanyLogo theme={theme} size={65} />
                </Link>

                {mounted && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-64 rounded-xl border border-slate-200/80 p-2 shadow-xl"
                    >
                        <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Switch Company
                        </p>
                        {userCompanies.map((c) => {
                            const active = c.slug === companySlug
                            return (
                                <DropdownMenuItem
                                    key={c.slug}
                                    onClick={() => switchCompany(c.slug)}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors group
                    ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <CompanyLogo theme={c} size={40} />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium leading-tight">{c.switcherName || c.name}</span>
                                    </span>
                                    {active && <Check className="h-4 w-4 flex-shrink-0 text-slate-600" />}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
            </div>

            {/* RIGHT: Mode / Head / User */}
            <div className="flex items-center gap-1">
                <Sep />

                {/* Mode dropdown */}
                {mounted && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none">
                            <NavTrigger 
                                label={mode ?? 'Select Module'} 
                                sublabel="Module" 
                            />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-52 rounded-xl border border-slate-200/80 p-2 shadow-xl"
                    >
                        <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Module
                        </p>
                        <DropItem
                            label="Development"
                            sublabel="DM · Data · Products"
                            active={mode === 'Development'}
                            icon={<Monitor className="w-4 h-4" />}
                            onClick={() => navigateMode('Development')}
                        />
                        <DropItem
                            label="Operations"
                            sublabel="Coming soon"
                            active={mode === 'Operations'}
                            icon={<Package className="w-4 h-4" />}
                            onClick={() => navigateMode('Operations')}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
                )}

                {/* Head dropdown — only when Development */}
                {mounted && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none" disabled={mode === 'Operations' || mode === null}>
                            <NavTrigger
                                label={mode === 'Operations' || mode === null ? 'N/A' : (head ?? 'Select Sub Dept')}
                                sublabel="Sub Dept"
                                disabled={mode === 'Operations' || mode === null}
                            />
                        </button>
                    </DropdownMenuTrigger>
                    {mode === 'Development' && (
                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl border border-slate-200/80 p-2 shadow-xl"
                        >
                            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Sub Dept
                            </p>
                            {HEAD_OPTIONS.map((opt) => (
                                <DropItem
                                    key={opt.label}
                                    label={opt.label}
                                    active={head === opt.label}
                                    icon={opt.icon}
                                    onClick={() => navigateHead(opt.label)}
                                />
                            ))}
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
                )}

                <Sep />

                {/* User menu popover */}
                {mounted && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="group inline-flex items-center gap-2.5 rounded-xl py-1.5 pl-2 pr-3 transition-all hover:bg-slate-50 focus:outline-none">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                {displayProfileUrl ? (
                                    <AvatarImage 
                                        src={displayProfileUrl} 
                                        alt={displayName}
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback
                                    className="text-xs font-bold text-white"
                                    style={{ backgroundColor: theme.primaryColor }}
                                    suppressHydrationWarning
                                >
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden flex-col items-start leading-none sm:flex">
                                <span className="text-sm font-semibold text-slate-800">{displayName}</span>
                                <span className="mt-0.5 text-[11px] text-slate-400">{displayCompany}</span>
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-slate-600" />
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        align="end"
                        className="w-80 overflow-hidden rounded-2xl border border-slate-200/80 p-0 shadow-2xl"
                    >
                        {/* Card header */}
                        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 pb-4 pt-5">
                            <div className="mb-4 flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    {displayProfileUrl ? (
                                        <AvatarImage 
                                            src={displayProfileUrl} 
                                            alt={displayName}
                                            className="object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback
                                        className="text-base font-bold text-white"
                                        style={{ backgroundColor: theme.primaryColor }}
                                        suppressHydrationWarning
                                    >
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{displayName}</p>
                                    {displayEmail && <p className="text-xs text-slate-400">{displayEmail}</p>}
                                    <p className="mt-0.5 text-xs text-slate-400">{displayDesignation}</p>
                                </div>
                            </div>

                            {/* Role toggle — only in HOD variant */}
                            {/* variant === 'hod' && (
                                <RoleToggle value={role} onChange={setRole} />
                            )} */}

                            {/* User selector — only in HOD mode */}
                            {variant === 'hod' && isHOD && users.length > 0 && (
                                <div className="mt-3">
                                    <p className="mb-1.5 text-xs font-medium text-slate-500">Viewing as</p>
                                    <select
                                        value={selectedUserId || ''}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                    >
                                        {users.map((u) => (
                                            <option key={u.userId} value={u.userId}>
                                                {u.name} — {u.position}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Company access chips */}
                            {variant === 'hod' ? (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {allCompanies.map((c) => {
                                        const isActive = c.slug === companySlug
                                        return (
                                        <span
                                            key={c.slug}
                                            className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: isActive ? c.primaryColor : '#f1f5f9',
                                                color: isActive ? 'white' : '#64748b',
                                            }}
                                        >
                                            {c.switcherName ?? c.name}
                                        </span>
                                    )})}
                                </div>
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {userCompanies.map((c) => {
                                        const isActive = c.slug === companySlug
                                        return (
                                        <span
                                            key={c.slug}
                                            className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: isActive ? c.primaryColor : '#f1f5f9',
                                                color: isActive ? 'white' : '#64748b',
                                            }}
                                        >
                                            {c.switcherName ?? c.name}
                                        </span>
                                    )})}
                                </div>
                            )}
                        </div>

                        {/* Navigation links */}
                        <nav className="px-3 py-2">
                            {variant === 'hod' && (
                                <>
                                    <Link
                                        href="/hod/user-mgt"
                                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <Users className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                        <span className="text-sm font-medium">User Management</span>
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                            HOD
                                        </Badge>
                                    </Link>
                                    <Link
                                        href="/hod/projection-data-form"
                                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                        <span className="text-sm font-medium">Projection Data Form</span>
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                            HOD
                                        </Badge>
                                    </Link>
                                </>
                            )}
                        </nav>

                        <div className="border-t border-slate-100 px-3 py-2">
                            <button 
                                onClick={() => { logout(); window.location.href = '/' }}
                                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm font-medium">Sign out</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
                )}
            </div>
        </header>
    )
}
