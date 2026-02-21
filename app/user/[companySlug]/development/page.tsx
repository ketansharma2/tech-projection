'use client'

import Link from 'next/link'
import { use, useMemo, useState } from 'react'
import {
  ArrowDown,
  Building2,
  ChevronDown,
  ChevronUp,
  Database,
  Globe,
  Megaphone,
  Package,
} from 'lucide-react'
import { getCompanyTheme } from '@/lib/company-config'

// Generate company-specific colors based on primary color
function getCompanyColors(primaryColor: string, headingColor: string) {
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
    heading: headingColor,
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

interface SubSection {
  id: string
  title: string
  status: 'Active' | 'OFF'
  items: string[]
  icon: typeof Building2
}

interface Section {
  id: string
  title: string
  summary: string
  icon: typeof Database
  href: string
  inHouse: SubSection
  outsourcing: SubSection
}

const statusStyles: Record<'Active' | 'OFF', string> = {
  Active: 'border border-emerald-200 bg-emerald-100/70 text-emerald-800',
  OFF: 'border border-border bg-muted text-muted-foreground',
}

function SubSectionCard({ sub, company }: { sub: SubSection; company: ReturnType<typeof getCompanyColors> }) {
  const isOff = sub.status === 'OFF'

  return (
    <div
      id={sub.id}
      className="rounded-xl border p-6 transition-colors"
      style={{ 
        borderColor: isOff ? company.brandBorder : company.brandBorder,
        backgroundColor: company.brandSurfaceSubtle,
        opacity: isOff ? 0.8 : 1
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <sub.icon 
            className="h-4 w-4" 
            style={{ color: isOff ? 'hsl(var(--muted-foreground))' : company.primaryColor }} 
          />
          <h3 className="text-base font-semibold text-foreground">{sub.title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[sub.status]}`}>
          {sub.status === 'Active' ? 'Active' : 'OFF / Inactive'}
        </span>
      </div>

      {isOff ? (
        <p className="text-sm italic text-muted-foreground">
          In-House development is currently inactive for this head.
        </p>
      ) : (
        <ul className="space-y-2">
          {sub.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <span 
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" 
                style={{ backgroundColor: `${company.primaryColor}8c` }} 
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DevelopmentPage({
  params,
}: {
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = use(params)
  const theme = getCompanyTheme(companySlug)
  const company = useMemo(() => getCompanyColors(theme.primaryColor, theme.headingColor), [theme.primaryColor, theme.headingColor])
  const basePath = `/user/${companySlug}`
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const sections = useMemo<Section[]>(
    () => [
      {
        id: 'data',
        title: 'Data Management',
        summary: 'Internal data systems, automation pipelines, and external integrations for recruitment workflows.',
        icon: Database,
        href: `${basePath}/development/data`,
        inHouse: {
          id: 'data-inhouse',
          title: 'In-House',
          icon: Building2,
          status: 'Active',
          items: [
            'Master database schema and intake pipeline checks',
            'Data quality validation and duplicate protection',
            'Tracker and reporting readiness updates',
          ],
        },
        outsourcing: {
          id: 'data-outsourcing',
          title: 'Out Sourcing',
          icon: Globe,
          status: 'Active',
          items: [
            'External integration and enrichment support',
            'Delegated automation and one-off extraction tasks',
          ],
        },
      },
      {
        id: 'dm',
        title: 'Digital Marketing',
        summary: 'SEO, content pipelines, analytics visibility, and social execution workstreams.',
        icon: Megaphone,
        href: `${basePath}/development/dm`,
        inHouse: {
          id: 'dm-inhouse',
          title: 'In-House',
          icon: Building2,
          status: 'Active',
          items: [
            'SEO plans and on-page optimization',
            'Content calendar and social execution',
            'Campaign reporting and engagement analytics',
          ],
        },
        outsourcing: {
          id: 'dm-outsourcing',
          title: 'Out Sourcing',
          icon: Globe,
          status: 'Active',
          items: [
            'Creative asset support',
            'Delegated ad and outreach execution',
          ],
        },
      },
      {
        id: 'products',
        title: 'Products',
        summary: 'Product module delivery, QA checkpoints, and release-readiness tracking.',
        icon: Package,
        href: `${basePath}/development/products`,
        inHouse: {
          id: 'products-inhouse',
          title: 'In-House',
          icon: Building2,
          status: 'OFF',
          items: [],
        },
        outsourcing: {
          id: 'products-outsourcing',
          title: 'Out Sourcing',
          icon: Globe,
          status: 'Active',
          items: [
            'Module implementation and delegated enhancements',
            'UI and delivery support with release coordination',
          ],
        },
      },
    ],
    [basePath]
  )

  const toggleCollapse = (sectionId: string) => {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen" style={{ background: `radial-gradient(140% 90% at 50% 0%, ${company.pageTint}ee, transparent 62%), ${company.pageTint}` }}>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 pt-[88px] pb-12 md:px-8">
        <div 
          className="rounded-3xl border px-6 py-12 shadow-2xl sm:px-10"
          style={{ 
            background: `linear-gradient(135deg, ${company.heroFrom}, ${company.heroTo})`,
            borderColor: `${company.heroTo}59`,
            boxShadow: `0 8px 24px ${company.heroTo}1f, 0 24px 48px ${company.heroTo}2e`
          }}
        >
          <div 
            className="mb-4 w-fit inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ 
              border: '1px solid rgba(255,255,255,0.55)', 
              background: 'rgba(255,255,255,0.18)', 
              color: '#ffffff' 
            }}
          >
            <ArrowDown className="h-3.5 w-3.5 text-white" />
            <span>Scroll to explore all heads</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">Development</h1>
          <p className="max-w-[680px] text-base leading-7 text-white/85">
            Core build function with in-house and outsourcing breakdowns for each head.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                <section.icon className="h-4 w-4" />
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-6xl px-6 pb-[72px] md:px-8">
        <div className="space-y-8">
          {sections.map((section, index) => {
            const isCollapsed = collapsed[section.id] ?? false
            return (
              <article 
                key={section.id} 
                id={section.id} 
                className="rounded-2xl p-8 scroll-mt-36 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ 
                  background: '#ffffff',
                  border: `1px solid ${company.primaryColor}24`,
                  boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${company.primaryColor}14`
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: company.iconTint, color: company.primaryColor }}
                    >
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: company.primaryColor }}>
                        Head {index + 1}
                      </p>
                      <h2 className="text-2xl font-bold" style={{ color: company.heading }}>{section.title}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={section.href}
                      className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ 
                        borderColor: company.brandBorder, 
                        backgroundColor: company.brandSurface, 
                        color: company.heading 
                      }}
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(section.id)}
                      className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                    >
                      {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isCollapsed ? (
                  <p className="ml-14 text-sm leading-7 text-muted-foreground">{section.summary}</p>
                ) : (
                  <>
                    <p className="mb-6 ml-14 text-sm leading-7 text-muted-foreground">{section.summary}</p>
                    <div className="grid gap-6 md:grid-cols-2">
                      <SubSectionCard sub={section.inHouse} company={company} />
                      <SubSectionCard sub={section.outsourcing} company={company} />
                    </div>
                  </>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
