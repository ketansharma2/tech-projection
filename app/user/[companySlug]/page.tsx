'use client'

import Link from 'next/link'
import { use, useMemo } from 'react'
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Code2,
  Crown,
  Database,
  Eye,
  Megaphone,
  Package,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { getCompanyTheme } from '@/lib/company-config'

// Generate company-specific colors based on primary color
function getCompanyColors(primaryColor: string) {
  return {
    primaryColor,
    heroFrom: primaryColor,
    heroTo: adjustColor(primaryColor, -30),
    pageTint: adjustColor(primaryColor, 95, true),
    chipBg: adjustColor(primaryColor, 85, true),
    chipText: adjustColor(primaryColor, -50),
    iconTint: adjustColor(primaryColor, 85, true),
    brandSurface: adjustColor(primaryColor, 85, true),
    brandSurfaceSubtle: adjustColor(primaryColor, 93, true),
    brandBorder: adjustColor(primaryColor, 70, true),
  }
}

// Helper to adjust colors
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

export default function UserCompanyPage({
  params,
}: {
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = use(params)
  const theme = getCompanyTheme(companySlug)
  const colors = useMemo(() => getCompanyColors(theme.primaryColor), [theme.primaryColor])
  const basePath = `/user/${companySlug}`

  return (
    <main className="min-h-screen" style={{ background: `radial-gradient(140% 90% at 50% 0%, ${colors.pageTint}ee, transparent 62%), ${colors.pageTint}` }}>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 pt-[88px] pb-12 md:px-8 md:pt-[88px]">
        <div 
          className="rounded-3xl border px-6 py-14 text-center shadow-2xl sm:px-10"
          style={{ 
            background: `linear-gradient(135deg, ${colors.heroFrom}, ${colors.heroTo})`,
            borderColor: `${colors.heroTo}59`,
            boxShadow: `0 8px 24px ${colors.heroTo}1f, 0 24px 48px ${colors.heroTo}2e`
          }}
        >
          <div 
            className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ 
              border: '1px solid rgba(255,255,255,0.55)', 
              background: 'rgba(255,255,255,0.18)', 
              color: '#ffffff' 
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Platform Overview</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            {theme.name} Tech Hub
          </h1>
          <p className="mx-auto max-w-[680px] text-base leading-7 text-white/85">
            Internal technology structure, teams, and modules powering {theme.name} workflows.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-6xl px-6 mt-[72px] md:px-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
          {/* What is Company Card */}
          <div 
            className="h-full rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ 
              background: '#ffffff',
              border: `1px solid ${colors.primaryColor}24`,
              boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${colors.primaryColor}14`
            }}
          >
            <div className="mb-3 flex items-center gap-4">
              <div 
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: colors.iconTint, color: colors.primaryColor }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold leading-7" style={{ color: colors.primaryColor }}>
                What is {theme.name}?
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{theme.tagline || 'A leading company in its field.'}</p>
          </div>

          {/* What is Tech Card */}
          <div 
            className="h-full rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ 
              background: '#ffffff',
              border: `1px solid ${colors.primaryColor}24`,
              boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${colors.primaryColor}14`
            }}
          >
            <div className="mb-3 flex items-center gap-4">
              <div 
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: colors.iconTint, color: colors.primaryColor }}
              >
                <Code2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold leading-7" style={{ color: colors.primaryColor }}>
                What is Tech for {theme.name}?
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{theme.techDescription || 'Modern technology solutions for business growth.'}</p>
          </div>
        </div>
      </section>

      {/* Tech Team Section */}
      <section className="mx-auto max-w-6xl px-6 mt-[72px] md:px-8">
        <div className="mb-6 text-center">
          <div 
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ 
              backgroundColor: colors.chipBg, 
              color: colors.chipText,
              border: `1px solid ${colors.brandBorder}b8`
            }}
          >
            <Users className="h-3.5 w-3.5" />
            Team
          </div>
          <h2 className="text-3xl font-bold" style={{ color: colors.primaryColor }}>Tech Team</h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <div 
            className="rounded-2xl p-8"
            style={{ 
              background: '#ffffff',
              border: `1px solid ${colors.primaryColor}24`,
              boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${colors.primaryColor}14`
            }}
          >
            <div className="space-y-4">
              {[
                { label: 'Total Team', value: '6', icon: Users },
                { label: 'Dept HOD', value: 'Bhavishya', icon: Crown },
                { label: 'Dept TL', value: 'Ajay', icon: Shield },
              ].map((item) => (
                <div 
                  key={item.label} 
                  className="grid items-center gap-4 rounded-xl p-4"
                  style={{ gridTemplateColumns: '56px 1fr', backgroundColor: colors.brandSurfaceSubtle }}
                >
                  <div 
                    className="flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ background: colors.iconTint, color: colors.primaryColor }}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{item.label}</p>
                    <p className="truncate text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}

              <div 
                className="grid items-start gap-4 rounded-xl p-4"
                style={{ gridTemplateColumns: '56px 1fr', backgroundColor: colors.brandSurfaceSubtle }}
              >
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: colors.iconTint, color: colors.primaryColor }}
                >
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Members</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Lovekush', 'Diwakar', 'Ansh', 'Kirti'].map((name) => (
                      <span 
                        key={name} 
                        className="text-[11px] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium"
                        style={{ 
                          backgroundColor: colors.chipBg, 
                          color: colors.chipText,
                          border: `1px solid ${colors.brandBorder}b8`
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Structure Section */}
      <section className="mx-auto max-w-6xl px-6 mt-[72px] md:px-8">
        <div className="mb-8 text-center">
          <div 
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ 
              backgroundColor: colors.chipBg, 
              color: colors.chipText,
              border: `1px solid ${colors.brandBorder}b8`
            }}
          >
            <Code2 className="h-3.5 w-3.5" />
            Architecture
          </div>
          <h2 className="text-3xl font-bold" style={{ color: colors.primaryColor }}>{theme.name} Tech Structure</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Development Card */}
          <Link 
            href={`${basePath}/development`} 
            className="block rounded-2xl p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ 
              background: '#ffffff',
              border: `1px solid ${colors.primaryColor}24`,
              boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${colors.primaryColor}14`,
              textDecoration: 'none'
            }}
          >
            <div className="mb-4 flex items-center gap-4">
              <div 
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: colors.iconTint, color: colors.primaryColor }}
              >
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.primaryColor }}>Development</h3>
                <p className="text-sm text-muted-foreground">Core build function</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Database, label: 'Data Management' },
                { icon: Megaphone, label: 'Digital Marketing' },
                { icon: Package, label: 'Products' },
              ].map((row) => (
                <div 
                  key={row.label} 
                  className="flex items-center gap-3 rounded-xl p-4 transition-colors hover:bg-slate-50"
                  style={{ backgroundColor: colors.brandSurfaceSubtle }}
                >
                  <row.icon className="h-4 w-4" style={{ color: colors.primaryColor }} />
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span 
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm"
                style={{ backgroundColor: colors.primaryColor, color: '#ffffff' }}
              >
                Open Development <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          {/* Operations Card */}
          <div 
            className="rounded-2xl p-8"
            style={{ 
              background: '#ffffff',
              border: `1px solid ${colors.primaryColor}24`,
              boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${colors.primaryColor}14`
            }}
          >
            <span 
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ opacity: 0.85 }}
            >
              <Clock className="h-3.5 w-3.5" />
              Coming Soon
            </span>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.primaryColor }}>Operations</h3>
                <p className="text-sm text-muted-foreground">Monitoring & improvements</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Sparkles, label: 'Improvement' },
                { icon: Eye, label: 'Monitoring' },
              ].map((row) => (
                <div 
                  key={row.label} 
                  className="flex items-center gap-3 rounded-xl p-4 opacity-85"
                  style={{ backgroundColor: colors.brandSurfaceSubtle }}
                >
                  <row.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm text-foreground">
                Open Operations <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="mx-auto max-w-6xl px-6 mt-[72px] md:px-8">
        <div className="mb-[20px] text-center">
          <div 
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ 
              backgroundColor: colors.chipBg, 
              color: colors.chipText,
              border: `1px solid ${colors.brandBorder}b8`
            }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Quick Access
          </div>
          <h2 className="text-3xl font-bold" style={{ color: colors.primaryColor }}>All Heads</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Data Management', href: `${basePath}/development/data`, icon: Database },
            { label: 'Digital Marketing', href: `${basePath}/development/dm`, icon: Megaphone },
            { label: 'Products', href: `${basePath}/development/products`, icon: Package },
          ].map((head) => (
            <Link 
              key={head.label} 
              href={head.href}
              className="block rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ 
                background: '#ffffff',
                border: `1px solid ${colors.primaryColor}24`,
                boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${colors.primaryColor}14`,
                textDecoration: 'none'
              }}
            >
              <div 
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: colors.iconTint, color: colors.primaryColor }}
              >
                <head.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-3 text-base font-semibold text-foreground">{head.label}</h3>
              <span 
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: colors.primaryColor }}
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center md:px-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {theme.name} ·{' '}
            {theme.domain ? (
              <a 
                href={`https://${theme.domain}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
                style={{ color: colors.primaryColor }}
              >
                {theme.domain}
              </a>
            ) : null}
          </p>
        </div>
      </footer>
    </main>
  )
}
