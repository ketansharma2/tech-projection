'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronDown,
    Check,
    Monitor,
    Package,
    BarChart3,
    Database,
    Users,
    Settings,
    User,
    LogOut,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { allCompanies, getCompanyTheme, type CompanyTheme } from '@/lib/company-config'
import { usePreviewState } from '@/hooks/use-preview-state'
import { logout, getUser } from '@/lib/auth'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Mode = 'Development' | 'Operations'
type Head = 'Digital Marketing' | 'Data Management' | 'Products'

const HEAD_OPTIONS: { label: Head; path: (slug: string) => string; icon: React.ReactNode }[] = [
    { label: 'Digital Marketing', path: (s) => `/${s}/development/dm`, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Data Management', path: (s) => `/${s}/development/data`, icon: <Database className="w-4 h-4" /> },
    { label: 'Products', path: (s) => `/${s}/development/products`, icon: <Package className="w-4 h-4" /> },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function deriveState(pathname: string): { mode: Mode; head: Head | null } {
    if (pathname.includes('/operations')) return { mode: 'Operations', head: null }
    let head: Head | null = 'Digital Marketing'
    if (pathname.includes('/development/data')) head = 'Data Management'
    else if (pathname.includes('/development/products')) head = 'Products'
    return { mode: 'Development', head }
}

// ─────────────────────────────────────────────
// Company Logo
// ─────────────────────────────────────────────
function CompanyLogo({ theme, size = 40 }: { theme: CompanyTheme; size?: number }) {
    const isGrad = theme.logoBackground?.startsWith('linear')
    return (
        <span
            className="inline-flex items-center justify-center rounded-xl font-bold text-white select-none flex-shrink-0"
            style={{
                width: size,
                height: size,
                fontSize: Math.round(size * 0.35),
                background: isGrad ? theme.logoBackground : undefined,
                backgroundColor: !isGrad ? theme.logoBackground : undefined,
                letterSpacing: '-0.02em',
            }}
        >
            {theme.logoInitials}
        </span>
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

    // Display based on role - use defaults to avoid SSR mismatch
    const displayName = (isHOD && selectedUser?.name) ? selectedUser.name : 'User'
    const displayRole = isHOD 
        ? (selectedUser?.position || 'Head of Department')
        : 'Team Member'
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

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
        const prefix = getPathPrefix()
        const pathPrefix = prefix ? `/${prefix}` : ''
        if (newMode === 'Operations') {
            router.push(`${pathPrefix}/${companySlug}/operations`)
        } else {
            router.push(getHeadPath(head ?? 'Digital Marketing'))
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
        >
            {/* LEFT: Company logo + switcher chevron */}
            <div className="flex items-center gap-1">
                <Link href={`/${companySlug}`} className="flex-shrink-0 focus:outline-none">
                    <CompanyLogo theme={theme} size={42} />
                </Link>

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
                        {allCompanies.map((c) => {
                            const active = c.slug === companySlug
                            return (
                                <DropdownMenuItem
                                    key={c.slug}
                                    onClick={() => switchCompany(c.slug)}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors group
                    ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <CompanyLogo theme={c} size={32} />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium leading-tight">{c.name}</span>
                                        {c.domain && (
                                            <span className="mt-0.5 block truncate text-xs text-slate-400">{c.domain}</span>
                                        )}
                                    </span>
                                    {active && <Check className="h-4 w-4 flex-shrink-0 text-slate-600" />}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* RIGHT: Mode / Head / User */}
            <div className="flex items-center gap-1">
                <Sep />

                {/* Mode dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none">
                            <NavTrigger label={mode} sublabel="Module" />
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

                {/* Head dropdown — only when Development */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none" disabled={mode === 'Operations'}>
                            <NavTrigger
                                label={mode === 'Operations' ? 'N/A' : (head ?? 'Digital Marketing')}
                                sublabel="Workstream"
                                disabled={mode === 'Operations'}
                            />
                        </button>
                    </DropdownMenuTrigger>
                    {mode === 'Development' && (
                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl border border-slate-200/80 p-2 shadow-xl"
                        >
                            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Workstream
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

                <Sep />

                {/* User menu popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="group inline-flex items-center gap-2.5 rounded-xl py-1.5 pl-2 pr-3 transition-all hover:bg-slate-50 focus:outline-none">
                            <Avatar className="h-8 w-8 flex-shrink-0">
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
                                <span className="mt-0.5 text-[11px] text-slate-400">{isHOD ? 'HOD' : 'USER'} View</span>
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
                                    <AvatarFallback
                                        className="text-base font-bold text-white"
                                        style={{ backgroundColor: theme.primaryColor }}
                                        suppressHydrationWarning
                                    >
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{displayName}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{displayRole}</p>
                                </div>
                            </div>

                            {/* Role toggle — only in HOD variant */}
                            {variant === 'hod' && (
                                <RoleToggle value={role} onChange={setRole} />
                            )}

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
                                    {allCompanies.map((c) => (
                                        <span
                                            key={c.slug}
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${c.slug === companySlug
                                                    ? 'bg-slate-800 text-white'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {c.switcherName ?? c.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    <span
                                        className="rounded-full px-2.5 py-1 text-xs font-medium bg-slate-800 text-white"
                                    >
                                        {allCompanies.find(c => c.slug === companySlug)?.name || companySlug}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Navigation links */}
                        <nav className="px-3 py-2">
                            {/* My View button — only in HOD variant */}
                            {variant === 'hod' && (
                                <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                                    <User className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    <span className="text-sm font-medium">My View</span>
                                </button>
                            )}

                            {isHOD && (
                                <>
                                    <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                                        <Users className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                        <span className="text-sm font-medium">User Management</span>
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                            HOD
                                        </Badge>
                                    </button>
                                    <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                                        <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                        <span className="text-sm font-medium">Projection Data Form</span>
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                            HOD
                                        </Badge>
                                    </button>
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
            </div>
        </header>
    )
}
