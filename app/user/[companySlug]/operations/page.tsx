'use client'

import { use, useMemo } from 'react'
import { Clock, Eye, Settings, Sparkles } from 'lucide-react'
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

export default function OperationsPage({
  params,
}: {
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = use(params)
  const theme = getCompanyTheme(companySlug)
  const company = useMemo(() => getCompanyColors(theme.primaryColor, theme.headingColor), [theme.primaryColor, theme.headingColor])

  return (
    <main className="min-h-screen" style={{ background: `radial-gradient(140% 90% at 50% 0%, ${company.pageTint}ee, transparent 62%), ${company.pageTint}` }}>
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl px-6 pt-[88px] pb-[72px] md:px-8">
        <div className="mx-auto flex flex-col items-center text-center">
          <div 
            className="w-full rounded-3xl border px-6 py-12 shadow-2xl sm:px-10"
            style={{ 
              background: `linear-gradient(135deg, ${company.heroFrom}, ${company.heroTo})`,
              borderColor: `${company.heroTo}59`,
              boxShadow: `0 8px 24px ${company.heroTo}1f, 0 24px 48px ${company.heroTo}2e`
            }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15">
              <Settings className="h-10 w-10 text-white" />
            </div>

            <div 
              className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ 
                border: '1px solid rgba(255,255,255,0.55)', 
                background: 'rgba(255,255,255,0.18)', 
                color: '#ffffff' 
              }}
            >
              <Clock className="h-3.5 w-3.5 text-white" />
              <span>Coming Soon</span>
            </div>

            <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">Operations</h1>
            <p className="mx-auto max-w-[680px] text-lg leading-8 text-white/85">
              Monitoring and improvements module for {theme.name} tech workflows.
            </p>
          </div>

          {/* Planned Heads */}
          <div 
            className="mt-8 w-full rounded-2xl p-6"
            style={{ 
              background: '#ffffff',
              border: `1px solid ${company.primaryColor}24`,
              boxShadow: `0 1px 2px rgba(15,23,42,0.03), 0 10px 28px ${company.primaryColor}14`
            }}
          >
            <h2 className="mb-5 text-lg font-semibold" style={{ color: company.heading }}>Planned Heads</h2>
            <div className="grid gap-6">
              {/* Improvement */}
              <div 
                className="flex items-center gap-4 rounded-xl p-4 opacity-85 transition-colors"
                style={{ backgroundColor: company.brandSurfaceSubtle }}
              >
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: company.iconTint, color: company.primaryColor }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Improvement</p>
                  <p className="text-sm text-muted-foreground">Process enhancement, feedback loops and optimization.</p>
                </div>
              </div>

              {/* Monitoring */}
              <div 
                className="flex items-center gap-4 rounded-xl p-4 opacity-85 transition-colors"
                style={{ backgroundColor: company.brandSurfaceSubtle }}
              >
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: company.iconTint, color: company.primaryColor }}
                >
                  <Eye className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Monitoring</p>
                  <p className="text-sm text-muted-foreground">System health, KPI dashboards, and alerting visibility.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6 text-left">
              <p className="text-sm text-muted-foreground">
                Operations module will be enabled after Development module is finalized.
              </p>
            </div>
          </div>
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
                style={{ color: company.primaryColor }}
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
