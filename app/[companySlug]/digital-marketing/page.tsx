import { redirect } from 'next/navigation'

export default async function DigitalMarketingPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = await params
  redirect(`/${companySlug}/development/dm`)
}
