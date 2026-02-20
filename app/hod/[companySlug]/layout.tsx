import AppHeader from '@/components/header'

export default async function HodLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ companySlug: string }>
}) {
  const { companySlug } = await params

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader companySlug={companySlug} variant="hod" />

      {/* Content */}
      {children}
    </div>
  )
}
